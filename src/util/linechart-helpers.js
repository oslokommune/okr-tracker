const height = 400;
const width = 800;
const padding = { left: 40, top: 20, right: 10, bottom: 40 };

export const innerHeight = height - padding.top - padding.bottom;
export const innerWidth = width - padding.left - padding.right;

const colors = {
  purple: '#2A2859',
  grey: '#F2F2F2',
  yellow: '#F9C66B',
};

export function initSvg(svg) {
  svg.attr('viewBox', `0 0 ${width} ${height}`).style('max-width', width);

  this.canvas = svg
    .append('g')
    .classed('canvas', true)
    .attr('transform', `translate(${padding.left}, ${padding.top})`);

  this.xAxis = this.canvas
    .append('g')
    .classed('axis x', true)
    .attr('transform', `translate(0, ${innerHeight})`);

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
