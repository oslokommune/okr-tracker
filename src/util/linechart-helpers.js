const padding = { left: 40, top: 20, right: 10, bottom: 40 };

const colors = {
  purple: '#2A2859',
  grey: '#F2F2F2',
  yellow: '#F9C66B',
};

export function initSvg(svg) {
  this.svg = svg;

  svg.style('width', '100%');

  this.canvas = svg
    .append('g')
    .classed('canvas', true)
    .attr('transform', `translate(${padding.left}, ${padding.top})`);

  this.xAxis = this.canvas.append('g').classed('axis x', true);

  this.yAxis = this.canvas.append('g').classed('axis y', true);
  this.valueLine = this.canvas.append('path').call(styleValueLine);
  this.target = this.canvas.append('line').classed('target', true);
  this.today = this.canvas.append('today').classed('today', true);
}

function styleValueLine(el) {
  el.classed('valueLine', true)
    .attr('fill', 'none')
    .attr('stroke', colors.purple)
    .attr('stroke-width', 3);
}

export function resize() {
  this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);

  this.innerHeight = this.height - padding.top - padding.bottom;
  this.innerWidth = this.width - padding.left - padding.right;

  this.xAxis.attr('transform', `translate(0, ${this.innerHeight})`);

  this.x.range([0, this.innerWidth]);
  this.y.range([this.innerHeight, 0]);
}
