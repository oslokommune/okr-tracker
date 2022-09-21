import Vue from 'vue';
import { select } from 'd3-selection';
import { scaleTime, scaleLinear } from 'd3-scale';
import { extent, max, min } from 'd3-array';
import { line, area, symbol, symbolCircle } from 'd3-shape';
import { axisLeft, axisBottom } from 'd3-axis';
import 'd3-transition';
// TODO: Replace v-tooltip with vue-tippy globally? Can
// seemingly be configured more or less as a drop-in
// replacement.
import { delegate } from 'tippy.js';
import 'tippy.js/dist/tippy.css';

import kpiTypes from '@/config/kpiTypes';
import {
  initSvg,
  resize,
  styleAxis,
  styleGradientStart,
  styleGradientStop,
  styleValueIndicators,
  styleValueLine,
} from './linechart-helpers';

import IndicatorTooltip from '@/components/IndicatorTooltip.vue';

function formatValue (value, kpi) {
  if (kpi && kpi.type) {
    return kpiTypes[kpi.type].formatValue(value);
  }
  return value;
}

export default class LineChart {
  constructor(svgElement, { height, theme } = {}) {
    if (!svgElement) {
      throw new Error('svg not defined');
    }

    this.theme = theme || 'blue';

    select(svgElement).selectAll('*').remove();

    select(svgElement).call(initSvg.bind(this));

    this.height = height || 250;
    this.x = scaleTime().clamp(true);
    this.y = scaleLinear().nice();

    this.area = area()
      .x0((d) => this.x(d.timestamp))
      .x1((d) => this.x(d.timestamp))
      .y1((d) => this.y(d.value))
      .y0((d) => this.y(d.startValue));

    this.line = line()
      .x((d) => this.x(d.timestamp))
      .y((d) => this.y(d.value));

    this.indicator = symbol(symbolCircle, 250);

    const Tooltip = Vue.extend(IndicatorTooltip);

    delegate(this.valueIndicators.node(), {
      target: '.indicator',
      trigger: 'mouseenter click',
      theme: 'ok',
      offset: [0, 10],
      allowHTML: true,
      content(ref) {
        const data = select(ref).datum();
        if (!data) return null;
        return new Tooltip({
          propsData: {
            timestamp: data.timestamp,
            value: data.value,
            comment: data?.comment,
          },
        }).$mount().$el.outerHTML;
      },
    });
  }

  /**
   * Render the graph. Takes the following parameters:
   *
   * `startValue`: Optional. The start value of the y axis. Will start at the
   *     lowest value present in `progress` if unset.
   *
   * `targetValue`: Optional. The end value of the y axis. Will end at the
   *     highest value present in `progress` if unset.
   *
   * `startDate`: The first date on the x axis.
   *
   * `endDate`: The last date on the x axis.
   *
   * `progress`: The array of values to plot.
   *
   * `kpi`: Optional. A KPI to format the y axis for.
   *
   * `theme`: Optional. A theme to render the graph in, overriding any theme
   *     set in the constructor.
   */
  render({ startValue, targetValue, startDate, endDate, progress, kpi, theme }) {
    if (theme) {
      this.theme = theme;
    }

    const lowestValue = min(progress, d => d.value);
    const highestValue = max(progress, d => d.value);

    startValue = typeof(startValue) === 'number' ? startValue : lowestValue;
    targetValue = typeof(targetValue) === 'number' ? targetValue : highestValue;

    this.width = this.svg.node().getBoundingClientRect().width;
    resize.call(this);

    this.x.domain([startDate, endDate]);

    if (startValue > targetValue) {
      this.y.domain(
        extent([
          startValue < highestValue ? highestValue : startValue,
          lowestValue < targetValue ? lowestValue : targetValue,
        ])
      );
    } else {
      this.y.domain(
        extent([
          startValue,
          startValue < targetValue && highestValue > targetValue
            ? highestValue
            : targetValue,
        ])
      );
    }

    this.yAxis
      .transition()
      .call(axisLeft(this.y).tickFormat((d) => formatValue(d, kpi)))
      .call(styleAxis);
    this.xAxis.transition().call(axisBottom(this.x).ticks(4)).call(styleAxis);

    this.today
      .attr('x1', this.x(new Date()))
      .attr('x2', this.x(new Date()))
      .attr('y2', 0)
      .attr('y1', this.innerHeight);

    const firstValue = {
      timestamp: startDate,
      value: +startValue,
      startValue: +startValue,
    };

    const datapoints = progress
      .map((d) => ({
        timestamp: d.timestamp.toDate(),
        value: +d.value,
        startValue: +startValue,
      }))
      .sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));

    const lastValue = datapoints.length
      ? +datapoints[datapoints.length - 1].value
      : firstValue.value;

    const todayValue = {
      timestamp: new Date(),
      value: lastValue,
      startValue: +startValue,
    };

    const data = [firstValue, ...datapoints, todayValue];

    this.valueArea.datum(data).transition().attr('d', this.area);

    this.valueLine.datum(data).transition().attr('d', this.line);
    this.valueLine.call(styleValueLine.bind(this));

    this.gradient.select('#start').call(styleGradientStart.bind(this));
    this.gradient.select('#stop').call(styleGradientStop.bind(this));

    this.valueIndicators
      .selectAll('path')
      .data(data)
      .join('path')
      .attr('transform', d => `translate(${this.x(d.timestamp)},${this.y(d.value)})`)
      .attr('d', this.indicator)
      .call(styleValueIndicators);
  }
}
