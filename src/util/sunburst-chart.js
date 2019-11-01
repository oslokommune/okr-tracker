import { select, partition, hierarchy, arc, scaleLinear, min } from 'd3';

import {
  initTooltip,
  initArcs,
  initLegend,
  drawArcs,
  drawArcBars,
  handleClick,
  handleMouseover,
  handleMouseLeave,
} from './sunburst-helpers';

const height = 900;
const width = 1400;

const fullCircle = true; // false = half circle

export default class Sunburst {
  constructor(svg) {
    this.highlight = false;

    this.svg = select(svg).attr('viewBox', `0 0 ${width} ${height}`);
    this.legend = this.svg.append('g').call(initLegend);
    this.canvas = this.svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

    this.tooltip = select('#app')
      .selectAll('div.tooltip')
      .data([true])
      .join('div')
      .call(initTooltip);

    // Path generator for the arcs that make up the graph
    this.arcGenerator = arc()
      .startAngle(d => (fullCircle ? d.x0 : d.x0 - Math.PI / 2))
      .endAngle(d => (fullCircle ? d.x1 : d.x1 - Math.PI / 2))
      .innerRadius(d => this.radius(d.y0))
      .outerRadius(d => this.radius(d.y1) - 3)
      .padAngle(0.005)
      .cornerRadius(5);

    // Path generator for the path for text labels inside nodes
    this.textArcGenerator = arc()
      .startAngle(d => (fullCircle ? d.x0 : d.x0 - Math.PI / 2))
      .endAngle(d => (fullCircle ? d.x1 : d.x1 - Math.PI / 2))
      .innerRadius(d => this.radius(d.y0 + 0.5))
      .outerRadius(d => this.radius(d.y0 + 0.5));
  }

  render(data) {
    // Create a d3 hiererchy root object
    const root = hierarchy(data[0]).sum(d => (d.unit ? 1 : 0));
    const depth = root.height + 1;

    // Use the root
    const partitionGenerator = partition().size([fullCircle ? Math.PI * 2 : Math.PI, depth]);
    partitionGenerator(root);

    // Scale for radii
    this.radius = scaleLinear()
      .range([0, min([width, height]) / 2])
      .domain([0, depth]);

    // Each node gets a <g> element holding all its components
    const nodes = this.canvas
      .selectAll('g.arc')
      .data(root.descendants(), d => d.id)
      .join(initArcs);

    // Trigger all the stuff we want to happen on the nodes
    nodes.call(drawArcs.bind(this));
    nodes.filter(d => d.depth === depth - 2).call(drawArcBars.bind(this));
    nodes.on('mousemove', handleMouseover.bind(this));
    nodes.on('mouseleave', handleMouseLeave.bind(this));
    nodes.on('click', handleClick.bind(this));
  }
}
