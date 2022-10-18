import Vue from 'vue';
import { select } from 'd3-selection';
// TODO: Replace v-tooltip with vue-tippy globally? Can
// seemingly be configured more or less as a drop-in
// replacement.
import { delegate } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import IndicatorTooltip from '@/components/IndicatorTooltip.vue';
import { addCommentSymbol } from './symbols';

export const padding = { left: 80, top: 20, right: 10, bottom: 25 };
const Tooltip = Vue.extend(IndicatorTooltip);

export const GRAPH_THEMES = {
  blue: {
    gradientStart: '#6EE9FF',
    gradientStop: '#D9D9D9',
    line: '#B3F5FF',
  },
  green: {
    gradientStart: '#42F8B6',
    gradientStop: '#D9D9D9',
    line: '#C7F7C9',
  },
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

  this.valueArea = this.canvas.append('path').call(styleArea);
  this.valueLine = this.canvas.append('path').call(styleValueLine.bind(this));
  this.target = this.canvas.append('line').classed('target', true);

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
  el.selectAll(".tick line").attr('stroke', 'var(--color-bg-dark)');
  el.select(".domain").attr('display', 'none');
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
    .attr('stroke', GRAPH_THEMES[this.theme].line)
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

  this.innerHeight = this.height - padding.top - padding.bottom;
  this.innerWidth = this.width - padding.left - padding.right;

  this.xAxis.attr('transform', `translate(0, ${this.innerHeight})`);

  this.x.range([0, this.innerWidth]);
  this.y.range([this.innerHeight, 0]);
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
