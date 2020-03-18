import { select, forceSimulation, drag, event, zoom } from 'd3';
import forces from './forces';

const colorBlue = '#6ee9ff';
const colorYellow = '#f8c66b';
const fontsize = 12;

export default class {
  constructor(svg, tree, departmentName) {
    this.width = 800;
    this.height = 550;
    this.radius = 12;

    this.svg = select(svg)
      .attr('height', this.height)
      .attr('width', this.width);

    this.svg.append('defs');

    this.container = this.svg.append('g').attr('class', 'container');

    this.container.append('g').attr('class', 'links');
    this.container.append('g').attr('class', 'nodes');

    this.svg.call(
      zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', () => {
          const text = this.container.selectAll('text');
          text.attr('font-size', fontsize / event.transform.k);
          this.container.attr('transform', event.transform);
        })
    );

    this.nodes = [{ id: 'root', type: 'root', name: departmentName }];
    this.links = [];

    this.generateLinksAndNodes(tree);

    this.run();
  }

  run() {
    this.simulation = forceSimulation(this.nodes)
      .force('charge', forces.charge.call(this))
      .force('center', forces.center.call(this))
      .force('collide', forces.collide.call(this))
      .force('link', forces.link.call(this))
      .on('tick', () => {
        this.updateLinks();
        this.updateNodes();
      });
  }

  updateLinks() {
    select('.links')
      .selectAll('line')
      .data(this.links, d => d.id)
      .join('line')
      .attr('stroke', 'black')
      .attr('stroke-width', 3)
      .attr('stroke-opacity', 0.15)
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
  }

  updateNodes() {
    const g = select('.nodes')
      .selectAll('g')
      .data(this.nodes, d => d.id)
      .join(this.enterNode.bind(this))
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .call(
        drag()
          .on('start', dragstarted.bind(this))
          .on('drag', dragged.bind(this))
          .on('end', dragended.bind(this))
      );

    this.svg
      .select('defs')
      .selectAll('clipPath')
      .data(this.nodes)
      .join(enter => {
        const clip = enter
          .append('clipPath')
          .attr('id', d => d.id)
          .append('circle')
          .attr('r', this.radius);
        return clip;
      });

    const image = g.select('image');

    image
      .attr('xlink:href', d => d.photoURL)
      .attr('clip-path', d => `url(#${d.id})`)
      .style('pointer-events', 'none');
  }

  generateLinksAndNodes(tree) {
    tree.forEach(product => {
      this.links.push({ source: 'root', target: product.id });
      const { id, photoURL, name, team } = product;
      this.nodes.push({ id, photoURL, name, type: 'product' });
      this.nodes = [...this.nodes, ...team.map(member => cleanupTeam.call(this, member, product)).filter(Boolean)];
    });
  }

  enterNode(el) {
    const g = el.append('g');

    g.append('circle')
      .attr('class', 'background')
      .attr('r', d => {
        if (d.type === 'root') return 0;
        return this.radius * 1.3;
      })
      .attr('fill', d => {
        if (d.type === 'user') return colorBlue;
        if (d.type === 'product') return colorYellow;
        return false;
      });

    const circle = g
      .append('circle')
      .attr('class', 'node')
      .attr('fill', d => {
        if (d.type === 'user') return 'steelblue';
        if (d.type === 'root') return 'black';
        return colorYellow;
      })
      .attr('r', d => {
        if (d.type === 'root') return this.radius * 0.75;
        return this.radius;
      });

    circle.on('mouseover', handleMouseEnter);
    circle.on('mouseleave', handleMouseLeave);

    g.append('image')
      .attr('x', -this.radius)
      .attr('y', -this.radius)
      .attr('height', this.radius * 2)
      .attr('width', this.radius * 2);

    g.append('text')
      .attr('dx', this.radius * 1.5)
      .attr('dy', fontsize / 4)
      .attr('font-size', fontsize)
      .style('user-select', 'none')
      .style('pointer-events', 'none')
      .attr('opacity', d => {
        if (d.type === 'user') return 0;
      })
      .text(d => d.name);

    return g;
  }
}

function cleanupTeam(member, product) {
  const { id, photoURL, displayName } = member;
  this.links.push({ source: product.id, target: id });

  if (this.nodes.map(node => node.id).includes(id)) {
    return false;
  }

  return { id, photoURL, name: displayName || id, type: 'user' };
}

function handleMouseEnter(d, i, j) {
  const parent = select(j[i].parentNode);
  const text = parent.select('text');

  text.attr('opacity', 1);
}

function handleMouseLeave(d, i, j) {
  const parent = select(j[i].parentNode);
  const text = parent.select('text');

  if (d.type === 'user') {
    text.attr('opacity', 0);
  }
}

function dragstarted(d) {
  event.sourceEvent.stopPropagation();
  if (!event.active) this.simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragended(d) {
  if (!event.active) this.simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
