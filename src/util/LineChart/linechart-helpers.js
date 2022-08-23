import { addCommentSymbol } from './symbols';

const padding = { left: 60, top: 20, right: 10, bottom: 25 };

export const GRAPH_COLORS = {
  gradientStart: 'var(--color-secondary)',
  gradientStop: '#D9D9D9',
  line: 'var(--color-secondary-light)',
};

export function initSvg(svg) {
  this.svg = svg;

  svg.style('width', '100%');

  this.canvas = svg
    .append('g')
    .classed('canvas', true)
    .attr('transform', `translate(${padding.left}, ${padding.top})`);

  this.xAxis = this.canvas
    .append('g')
    .classed('axis x', true);
  this.yAxis = this.canvas
    .append('g')
    .classed('axis y', true);

  this.valueArea = this.canvas.append('path').call(styleArea);
  this.valueLine = this.canvas.append('path').call(styleValueLine.bind(this));
  this.target = this.canvas.append('line').classed('target', true);
  this.today = this.canvas
    .append('line')
    .classed('today', true)
    .attr('stroke', 'black')
    .attr('stroke-opacity', 0.2);

  this.defs = this.svg.append('defs')
  this.gradient = this.defs
    .append('linearGradient')
    .attr('id', 'areaGradient')
    .attr('x1', '0%')
    .attr('x2', '0%')
    .attr('y1', '0%')
    .attr('y2', '100%');

  this.gradient
    .append('stop')
    .attr('id', 'start')
    .call(styleGradientStart.bind(this));
  this.gradient
    .append('stop')
    .attr('id', 'stop')
    .call(styleGradientStop.bind(this));

  this.valueIndicators = this.canvas
    .append('g')
    .classed('indicators', true);

  this.defs
    .call(addCommentSymbol);
}

export function styleAxis(el) {
  el.attr('stroke-opacity', 0.6)
    .attr('font-size', 14)
    .attr('font-family', '"OsloSans", Helvetica, Arial, sans-serif')
    .attr('color', 'var(--color-grey-600)');
}

export function styleGradientStart(el) {
  el.attr('offset', '0%').attr(
    'style',
    `stop-color:${GRAPH_COLORS.gradientStart};stop-opacity:1;`
  );
}

export function styleGradientStop(el) {
  el.attr('offset', '100%').attr(
    'style',
    `stop-color:${GRAPH_COLORS.gradientStop};stop-opacity:0;`
  );
}

export function styleValueLine(el) {
  el.classed('valueLine', true)
    .attr('fill', 'none')
    .attr('stroke', GRAPH_COLORS.line)
    .attr('stroke-width', 3);
}

export function styleValueIndicators(el) {
  el.classed('indicator', true)
    .style('fill', (d) => {
      return (d?.comment ? 'url(#comment-symbol)' : 'transparent')
    })
}

function styleArea(el) {
  el.classed('area', true)
    .attr('fill', 'url(#areaGradient)')
    .attr('fill-opacity', 0.4);
}

export function resize() {
  this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);

  this.innerHeight = this.height - padding.top - padding.bottom;
  this.innerWidth = this.width - padding.left - padding.right;

  this.xAxis.attr('transform', `translate(0, ${this.innerHeight})`);

  this.x.range([0, this.innerWidth]);
  this.y.range([this.innerHeight, 0]);
}
