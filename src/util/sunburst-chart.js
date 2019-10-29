import { select, selectAll, partition, hierarchy, arc, scaleLinear, interpolatePlasma } from 'd3';

const labels = ['Origo', 'Produktområder', 'Produkter', 'Mål', 'Nøkkelresultater'];

export default class Sunburst {
  constructor(svg) {
    this.svg = select(svg)
      .attr('width', 700)
      .attr('height', 700);

    this.canvas = this.svg.append('g').attr('transform', `translate(${350}, ${350})`);
  }

  render(data) {
    // Create a d3 hiererchy root object
    const root = hierarchy(data[0]).sum(d => (d.unit ? 1 : 0));

    const depth = root.height + 1;

    // Use the root
    const partitionGenerator = partition().size([Math.PI * 1, depth]);
    partitionGenerator(root);

    const radius = scaleLinear()
      .range([0, 300])
      .domain([0, depth]);

    const colors = interpolatePlasma;

    const arcGenerator = arc()
      .startAngle(d => d.x0 - Math.PI / 2)
      .endAngle(d => d.x1 - Math.PI / 2)
      .innerRadius(d => radius(d.y0))
      .outerRadius(d => radius(d.y1));

    this.canvas
      .selectAll('g.label')
      .data(labels)
      .join(enter => {
        const g = enter.append('g');

        g.attr('transform', (d, i) => {
          return `translate(${radius(i + 1) - 20}, ${30})`;
        });
        g.append('text')
          .text(d => d)
          .attr('text-anchor', 'end')
          .attr('transform', 'rotate(-30)');

        return g;
      })
      .classed('label', true);

    const arcs = this.canvas
      .selectAll('path')
      .data(root.descendants())
      .join('path')
      .attr('d', arcGenerator)
      .style('stroke', '#fff')
      // .attr('opacity', d => d.data.progression)
      .attr('fill', d => colors(d.depth / depth));

    arcs.on('mouseover', (d, i, j) => {
      selectAll(j).attr('opacity', 0.2);
      const childIds = d.descendants().map(d => d.data.id);
      const childNodes = j.filter(d => childIds.includes(d.__data__.data.id));
      selectAll(childNodes).attr('opacity', 1);

      const obj = d.data;
      const name = obj.organisation || obj.department || obj.product || obj.objective_title || obj.key_result;

      console.log(name); // display the name in tooltip?
    });

    arcs.on('mouseleave', (d, i, j) => {
      selectAll(j).attr('opacity', 1);
    });
  }
}
