import Vue from 'vue';
import { select } from 'd3-selection';
import { sum } from 'd3-array';
// TODO: Replace v-tooltip with vue-tippy globally? Can
// seemingly be configured more or less as a drop-in
// replacement.
import { delegate } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import IndicatorTooltip from '@/components/IndicatorTooltip.vue';
import { addCommentSymbol } from './symbols';

export const CANVAS_PADDING = { left: 80, top: 20, right: 45, bottom: 25 };
const LEGEND_HEIGHT = 75;
const LEGEND_LABEL_SPACING = 10;
const Tooltip = Vue.extend(IndicatorTooltip);

export const GRAPH_COLORS = {
  valueLine: 'var(--graph-value-line, var(--color-blue-light))',
  targetLine: 'var(--graph-target-line, var(--color-green))',
};

export function initSvg(svg) {
  this.svg = svg;

  svg.style('width', '100%');

  this.canvas = svg
    .append('g')
    .classed('canvas', true)
    .attr('transform', `translate(${CANVAS_PADDING.left}, ${CANVAS_PADDING.top})`);

  this.xAxis = this.canvas.append('g').classed('axis x', true);
  this.yAxis = this.canvas.append('g').classed('axis y', true);

  this.valueArea = this.canvas.append('path').call(styleArea);
  this.valueLine = this.canvas.append('path').call(styleValueLine.bind(this));
  this.targetLine = this.canvas.append('path').call(styleTargetLine.bind(this));

  this.defs = this.svg.append('defs');
  this.legendContainer = this.canvas.append('g').classed('legend', true);
  this.valueIndicators = this.canvas.append('g').classed('indicators', true);
  this.valueTooltips = null;
  this.defs.call(addCommentSymbol);
}

function styleAxis(el) {
  el.attr('stroke-opacity', 0.6)
    .attr('font-size', 14)
    .attr('font-family', '"Oslo Sans", Helvetica, Arial, sans-serif')
    .attr('color', 'var(--color-grayscale-70)');
}

export function styleAxisX(el) {
  styleAxis(el);
}

export function styleAxisY(el) {
  styleAxis(el);
  el.selectAll('.tick line').attr('stroke', 'var(--color-grayscale-10)');
  el.select('.domain').attr('display', 'none');
}

export function styleValueLine(el) {
  el.classed('valueLine', true)
    .attr('fill', 'none')
    .attr('stroke', GRAPH_COLORS.valueLine)
    .attr('stroke-width', 3);
}

export function styleTargetLine(el) {
  el.classed('targetLine', true)
    .attr('fill', 'none')
    .attr('stroke', GRAPH_COLORS.targetLine)
    .attr('stroke-width', 3);
}

export function styleValueIndicators(el) {
  el.classed('indicator', true).style('fill', (d) =>
    d?.comment ? 'url(#comment-symbol)' : 'transparent'
  );
}

function styleArea(el) {
  el.classed('area', true)
    .attr('fill', GRAPH_COLORS.valueLine)
    .attr('fill-opacity', 0.25);
}

export function resize() {
  this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);

  this.innerHeight =
    this.height -
    CANVAS_PADDING.top -
    (this.legend ? CANVAS_PADDING.bottom + LEGEND_HEIGHT : CANVAS_PADDING.bottom);
  this.innerWidth = this.width - CANVAS_PADDING.left - CANVAS_PADDING.right;

  this.xAxis.attr('transform', `translate(0, ${this.innerHeight})`);

  this.x.range([0, this.innerWidth]);
  this.y.range([this.innerHeight, 0]);
}

export function populateLegend(el) {
  const item = el.join('g');

  item
    .append('rect')
    .attr('fill', (d) => d.color)
    .attr('height', 12)
    .attr('width', 12);

  item
    .append('text')
    .attr('x', 18)
    .attr('y', 10)
    .text((d) => d.label)
    .attr('dy', '.1em')
    .style('text-anchor', 'start')
    .style('font-size', '14px')
    .style('font-family', '"Oslo Sans", Helvetica, Arial, sans-serif')
    .style('fill', 'var(--color-grayscale-70)');

  item.attr('transform', (d, i) => {
    const x = sum(item.data(), (e, j) => {
      const node = item.nodes()[j];
      return (j < i ? node.getBBox().width : 0) + LEGEND_LABEL_SPACING * i;
    });
    return `translate(${x},0)`;
  });

  // Position legend container
  const { width, height } = this.legendContainer.node().getBBox();
  const legendX = (this.width - width) / 2 - CANVAS_PADDING.left;
  const legendY = this.innerHeight + LEGEND_HEIGHT / 2 + height;
  this.legendContainer.attr('transform', `translate(${legendX},${legendY})`);
}

export function addValueTooltips(el) {
  if (this.valueTooltips) {
    this.valueTooltips.destroy();
  }

  this.valueTooltips = delegate(el.node(), {
    target: '.indicator',
    trigger: 'mouseenter click',
    theme: 'ok',
    offset: [0, 10],
    allowHTML: true,
    content(ref) {
      const data = select(ref).datum();
      if (!data) {
        return '';
      }
      return new Tooltip({
        propsData: {
          timestamp: data.timestamp,
          value: data.value,
          kpi: data.kpi,
          comment: data?.comment,
        },
      }).$mount().$el.outerHTML;
    },
  });
}
