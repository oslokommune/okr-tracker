import { select, selectAll, scaleLinear, scaleThreshold, interpolateBlues, event } from 'd3';
import { legendColor } from 'd3-svg-legend';
import { formatPercent } from './pie-helpers';

const colorDomain = [0.01, 0.25, 0.5, 0.75, 0.99, 1];
const colorRanges = [0.15, 0.6, 0.7, 0.8, 0.9, 1];

const colorScale = interpolateBlues;
const colorIntensity = scaleThreshold()
  .range(colorRanges.map(d => colorScale(d)))
  .domain(colorDomain);

function showTooltip(d) {
  const name = getNameFromObject(d);

  this.tooltip
    .text(`${formatPercent(d.data.progression)}: ${name}`)
    .style('opacity', 1)
    .style('transform', `translate(${event.clientX}px, ${event.clientY + 30}px)`);
}

function initLegend(el) {
  const legend = legendColor()
    .scale(colorIntensity)
    .title('Progresjon')
    .labelDelimiter(' til ')
    .labelFormat(formatPercent)
    .labels(legendLabels);

  el.attr('transform', `translate(0, 60)`).call(legend);
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

  g.append('path')
    .classed('text-path', true)
    .attr('fill', 'none');

  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .attr('opacity', 0.8)
    .attr('font-size', 13)
    .style('pointer-events', 'none')
    .attr('dominant-baseline', 'middle')
    .append('textPath')
    .append('tspan');

  return g;
}

function handleMouseover(d, i, j) {
  if (this.highlight) return;

  // Trigger the tooltip
  showTooltip.call(this, d);

  // Fade out all nodes
  selectAll(j)
    .select('path.arc')
    .attr('opacity', 0.75)
    .attr('fill', () => colorIntensity(-0.15));

  // Find the related child nodes and fade them back in
  const childIds = d.descendants().map(dj => dj.data.id);
  const childNodes = j.filter(dj => childIds.includes(dj.__data__.data.id));
  selectAll(childNodes)
    .select('path.arc')
    .attr('opacity', 1)
    .attr('fill', dj => colorIntensity(dj.data.progression));
}

function handleMouseLeave(d, i, j) {
  if (this.highlight) return;
  hideTooltip.call(this);

  selectAll(j)
    .select('path.arc')
    .attr('opacity', 1)
    .attr('fill', dj => colorIntensity(dj.data.progression));
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

  el.selectAll('path.text-path').call(drawTextPath.bind(this));
  el.selectAll('textPath').attr('xlink:href', d => `#tp-${d.data.id}`);
  el.filter(d => d.y1 < 4)
    .selectAll('tspan')
    .text(getNameFromObject);

  el.filter(d => d.y1 < 4)
    .select('textPath')
    .attr('startOffset', d => {
      const angle = (d.x1 + d.x0) / 2;

      if (angle < Math.PI / 2 || angle > Math.PI * 1.5) {
        return '25%';
      }
      return '75%';
    });
}

function drawTextPath(el) {
  el.attr('id', d => `tp-${d.data.id}`).attr('d', d => {
    const w = scaleLinear().range([d.x0, d.x1]); // bar width

    const pathData = this.textArcGenerator({
      x0: w(0.05),
      x1: w(0.95),
      y0: d.y0,
    })
      .split('A')
      .filter((dj, i) => i < 3)
      .join('A');

    return pathData;
  });
}

function legendLabels({ i, genLength, generatedLabels, labelDelimiter }) {
  if (i === 0) {
    const values = generatedLabels[i].split(` ${labelDelimiter} `);
    return `Mindre enn ${values[1]}`;
  }
  if (i === genLength - 1) {
    const values = generatedLabels[i].split(` ${labelDelimiter} `);
    return `${values[0]} eller mer`;
  }
  return generatedLabels[i];
}

function getNameFromObject(d) {
  const obj = d.data;
  const name = obj.organisation || obj.department || obj.product || obj.name || obj.description;

  return name;
}

function handleClick(el, i, j) {
  const { id } = el.data;
  this.highlight = this.highlight === id ? false : id;

  selectAll(j)
    .select('text')
    .attr('font-weight', 400)
    .attr('font-size', 13);

  if (!this.highlight) return;

  select(j[i])
    .select('text')
    .attr('font-weight', 500)
    .attr('font-size', 15);
}

export { initTooltip, initArcs, drawArcs, drawArcBars, handleMouseover, handleClick, handleMouseLeave, initLegend };
