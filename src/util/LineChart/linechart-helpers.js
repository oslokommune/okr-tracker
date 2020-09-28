const padding = { left: 40, top: 20, right: 10, bottom: 40 };

const colors = {
  purple: '#2A2859',
  grey: '#F2F2F2',
  yellow: '#F9C66B',
};

export function initSvg(svg) {
  this.svg = svg;

  svg.style('width', '100%');

  this.canvas = svg.append('g').classed('canvas', true).attr('transform', `translate(${padding.left}, ${padding.top})`);

  this.xAxis = this.canvas.append('g').classed('axis x', true);

  this.valueArea = this.canvas.append('path').call(styleArea);

  this.yAxis = this.canvas.append('g').classed('axis y', true);
  this.valueLine = this.canvas.append('path').call(styleValueLine);
  this.target = this.canvas.append('line').classed('target', true);
  this.today = this.canvas.append('line').classed('today', true).attr('stroke', 'black').attr('stroke-opacity', 0.2);

  const gradient = this.svg
    .append('defs')
    .append('linearGradient')
    .attr('id', 'areaGradient')
    .attr('x1', '0%')
    .attr('x2', '0%')
    .attr('y1', '0%')
    .attr('y2', '100%');

  gradient.append('stop').attr('offset', '0%').attr('style', `stop-color:${colors.purple};stop-opacity:1;`);
  gradient.append('stop').attr('offset', '100%').attr('style', `stop-color:${colors.purple};stop-opacity:0;`);
}

function styleValueLine(el) {
  el.classed('valueLine', true).attr('fill', 'none').attr('stroke', colors.purple).attr('stroke-width', 3);
}

function styleArea(el) {
  el.classed('area', true).attr('fill', 'url(#areaGradient)').attr('fill-opacity', 0.4);
}

export function resize() {
  this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);

  this.innerHeight = this.height - padding.top - padding.bottom;
  this.innerWidth = this.width - padding.left - padding.right;

  this.xAxis.attr('transform', `translate(0, ${this.innerHeight})`);

  this.x.range([0, this.innerWidth]);
  this.y.range([this.innerHeight, 0]);
}
