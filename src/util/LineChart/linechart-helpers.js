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

export const CANVAS_PADDING = { left: 80, top: 20, right: 10, bottom: 25 };
const LEGEND_HEIGHT = 75;
const LEGEND_LABEL_SPACING = 10;
const Tooltip = Vue.extend(IndicatorTooltip);

export const GRAPH_THEMES = {
  blue: {
    gradientStart: '#6EE9FF',
    gradientStop: '#D9D9D9',
    valueLine: '#B3F5FF',
    targetLine: '#43f8b6',
  },
  green: {
    gradientStart: '#42F8B6',
    gradientStop: '#D9D9D9',
    valueLine: '#C7F7C9',
    targetLine: '#B3F5FF',
  },
  knowit: {
    gradientStart: '#034b45',
    gradientStop: '#034b45',
    line: '#034b45',
  }
};

export function initSvg(svg) {
  this.svg = svg;

  svg.style('width', '100%');

  this.canvas = svg
    .append('g')
    .classed('canvas', true)
    .attr(
      'transform',
      `translate(${CANVAS_PADDING.left}, ${CANVAS_PADDING.top})`
    );

  this.xAxis = this.canvas.append('g').classed('axis x', true);
  this.yAxis = this.canvas.append('g').classed('axis y', true);

  this.valueArea = this.canvas.append('path').call(styleArea);
  this.valueLine = this.canvas.append('path').call(styleValueLine.bind(this));
  this.targetLine = this.canvas.append('path').call(styleTargetLine.bind(this));

  this.defs = this.svg.append('defs');
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

  this.legendContainer = this.canvas.append('g').classed('legend', true);
  this.valueIndicators = this.canvas.append('g').classed('indicators', true);
  this.valueTooltips = null;
  this.defs.call(addCommentSymbol);
}

function styleAxis(el) {
  el.attr('stroke-opacity', 0.6)
    .attr('font-size', 14)
    .attr('font-family', '"OsloSans", Helvetica, Arial, sans-serif')
    .attr('color', 'var(--color-grey-700)');
}

export function styleAxisX(el) {
  styleAxis(el);
}

export function styleAxisY(el) {
  styleAxis(el);
  el.selectAll('.tick line').attr('stroke', 'var(--color-bg-dark)');
  el.select('.domain').attr('display', 'none');
}

export function styleGradientStart(el) {
  el.attr('offset', '0%').attr(
    'style',
    `stop-color:${GRAPH_THEMES[this.theme].gradientStart};stop-opacity:1;`
  );
}

export function styleGradientStop(el) {
  el.attr('offset', '100%').attr(
    'style',
    `stop-color:${GRAPH_THEMES[this.theme].gradientStop};stop-opacity:0;`
  );
}

export function styleValueLine(el) {
  el.classed('valueLine', true)
    .attr('fill', 'none')
    .attr('stroke', GRAPH_THEMES[this.theme].valueLine)
    .attr('stroke-width', 3);
}

export function styleTargetLine(el) {
  el.classed('targetLine', true)
    .attr('fill', 'none')
    .attr('stroke', GRAPH_THEMES[this.theme].targetLine)
    .attr('stroke-width', 3);
}

export function styleValueIndicators(el) {
  el.classed('indicator', true).style('fill', (d) =>
    d?.comment ? 'url(#comment-symbol)' : 'transparent'
  );
}

function styleArea(el) {
  el.classed('area', true)
    .attr('fill', 'url(#areaGradient)')
    .attr('fill-opacity', 0.4);
}

export function resize() {
  this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);

  this.innerHeight =
    this.height -
    CANVAS_PADDING.top -
    (this.legend
      ? CANVAS_PADDING.bottom + LEGEND_HEIGHT
      : CANVAS_PADDING.bottom);
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
    .style('font-family', '"OsloSans", Helvetica, Arial, sans-serif')
    .style('fill', 'var(--color-grey-700)');

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
  if (this.valueTooltips) this.valueTooltips.destroy();

  this.valueTooltips = delegate(el.node(), {
    target: '.indicator',
    trigger: 'mouseenter click',
    theme: 'ok',
    offset: [0, 10],
    allowHTML: true,
    content(ref) {
      const data = select(ref).datum();
      if (!data) return '';
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
