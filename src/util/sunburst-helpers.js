import { select, selectAll, scaleLinear, interpolatePuBu, event } from 'd3';
import { formatPercent } from './pie-helpers';

const colorScale = interpolatePuBu;
const colorIntensity = scaleLinear().range([colorScale(0.4), colorScale(0.7)]);

function showTooltip(d) {
  const obj = d.data;
  const name = obj.organisation || obj.department || obj.product || obj.objective_title || obj.key_result;

  this.tooltip
    .text(formatPercent(d.data.progression) + ': ' + name)
    .style('opacity', 1)
    .style('transform', `translate(${event.clientX}px, ${event.clientY + 30}px)`);
}

function hideTooltip() {
  this.tooltip.style('opacity', 0);
}

function initTooltip(el) {
  return el
    .classed('tooltip', true)
    .style('opacity', 0)
    .style('position', 'fixed')
    .style('max-width', '240px')
    .style('font-size', '0.9rem')
    .style('line-height', 1.2)
    .style('font-weight', 500)
    .style('background', 'black')
    .style('color', 'rgba(255,255,255,0.8)')
    .style('border-radius', '5px')
    .style('top', 0)
    .style('left', 0)
    .style('padding', '0.5rem 0.75rem')
    .style('pointer-events', 'none')
    .style('z-index', 100);
}

function initArcs(enter) {
  const g = enter.append('g');

  g.append('path')
    .classed('arc', true)
    .attr('fill', 'steelblue');

  g.append('path')
    .classed('bar', true)
    .attr('fill', '#eee')
    .attr('stroke', 'white')
    .attr('stroke-width', 5);

  return g;
}

function handleMouseover(d, i, j) {
  selectAll(j)
    .select('path.arc')
    .attr('opacity', 0.75)
    .attr('fill', () => colorIntensity(-0.15));

  const childIds = d.descendants().map(d => d.data.id);
  const childNodes = j.filter(d => childIds.includes(d.__data__.data.id));
  selectAll(childNodes)
    .select('path.arc')
    .attr('opacity', 1)
    .attr('fill', d => colorIntensity(d.data.progression));
}

function handleMouseLeave(d, i, j) {
  hideTooltip.call(this);

  selectAll(j)
    .select('path.arc')
    .attr('opacity', 1)
    .attr('fill', d => colorIntensity(d.data.progression));
}

function drawArcBars(el) {
  el.each((d, i, j) => {
    const l = scaleLinear().range([5.2, 6]); // bar length
    const w = scaleLinear().range([d.x0, d.x1]); // bar width

    select(j[i])
      .select('path.bar')
      .attr('d', () => {
        return this.arcGenerator({
          x0: w(0.35),
          x1: w(0.65),
          y0: 5.2,
          y1: l(d.data.progression),
        });
      });
  });
}

function drawArcs(el) {
  el.selectAll('path.arc')
    .attr('d', this.arcGenerator)
    .style('stroke', '#fff')
    .style('stroke-opacity', 0.4)
    .attr('fill', d => colorIntensity(d.data.progression));
}

export { initTooltip, initArcs, drawArcs, drawArcBars, handleMouseover, showTooltip, handleMouseLeave };
