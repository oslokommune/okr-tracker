import { select, partition, hierarchy, arc, scaleLinear, min } from 'd3';

import {
  initTooltip,
  initArcs,
  drawArcs,
  drawArcBars,
  handleMouseover,
  showTooltip,
  handleMouseLeave,
} from './sunburst-helpers';

const height = 600;
const width = 900;

export default class Sunburst {
  constructor(svg) {
    this.svg = select(svg)
      .attr('width', width)
      .attr('height', height);

    this.canvas = this.svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

    this.tooltip = select('#app')
      .append('div')
      .call(initTooltip);
  }

  render(data) {
    // Create a d3 hiererchy root object
    const root = hierarchy(data[0]).sum(d => (d.unit ? 1 : 0));

    const depth = root.height + 1;

    // Use the root
    const partitionGenerator = partition().size([Math.PI * 2, depth]);
    partitionGenerator(root);

    const radius = scaleLinear()
      .range([0, min([width, height]) / 2])
      .domain([0, depth]);

    this.arcGenerator = arc()
      .startAngle(d => d.x0 - Math.PI / 2)
      .endAngle(d => d.x1 - Math.PI / 2)
      .innerRadius(d => radius(d.y0))
      .outerRadius(d => radius(d.y1));

    const arcs = this.canvas
      .selectAll('g.arc')
      .data(root.descendants())
      .join(initArcs);

    arcs.call(drawArcs.bind(this));
    arcs.filter(d => d.depth === depth - 2).call(drawArcBars.bind(this));
    arcs.on('mouseover', handleMouseover.bind(this));
    arcs.on('mousemove', showTooltip.bind(this));
    arcs.on('mouseleave', handleMouseLeave.bind(this));
  }
}
