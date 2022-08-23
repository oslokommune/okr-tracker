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

const formatValue = (value, item) => {
  if (item && item.type) {
    return kpiTypes[item.type].formatValue(value);
  }
  return value;
};

export default class LineChart {
  constructor(svgElement, { height }) {
    if (!svgElement) {
      throw new Error('svg not defined');
    }

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
        if (!data)
          return;
        return new Tooltip({
          propsData: {
            timestamp: data.timestamp,
            value: data.value,
            comment: data?.comment
          }
        }).$mount().$el.outerHTML;
      }
    });
  }

  render({ obj, period, progressionList, item }) {
    this.period = period;
    this.obj = obj;

    const highestValue = max(progressionList, (d) => d.value);
    const lowestValue = min(progressionList, (d) => d.value);

    this.width = this.svg.node().getBoundingClientRect().width;
    resize.call(this);

    const startDate =
      period.startDate && period.startDate.toDate
        ? period.startDate.toDate()
        : new Date(period.startDate);
    const endDate =
      period.endDate && period.endDate.toDate
        ? period.endDate.toDate()
        : new Date(period.endDate);

    this.x.domain([startDate, endDate]);

    if (obj.startValue > obj.targetValue) {
      this.y.domain(
        extent([
          obj.startValue < highestValue ? highestValue : obj.startValue,
          obj.startValue > obj.targetValue && lowestValue < obj.targetValue
            ? lowestValue
            : obj.targetValue,
        ])
      );
    } else {
      this.y.domain(
        extent([
          obj.startValue,
          obj.startValue < obj.targetValue && highestValue > obj.targetValue
            ? highestValue
            : obj.targetValue,
        ])
      );
    }

    this.yAxis
      .transition()
      .call(axisLeft(this.y).tickFormat((d) => formatValue(d, item)))
      .call(styleAxis);
    this.xAxis
      .transition()
      .call(axisBottom(this.x).ticks(4))
      .call(styleAxis);

    this.today
      .attr('x1', this.x(new Date()))
      .attr('x2', this.x(new Date()))
      .attr('y2', 0)
      .attr('y1', this.innerHeight);

    const startValue = {
      timestamp: period.startDate.toDate(),
      value: +obj.startValue,
      startValue: +obj.startValue,
    };

    const datapoints = progressionList
      .map((d) => ({
        timestamp: d.timestamp.toDate(),
        value: +d.value,
        startValue: +obj.startValue,
      }))
      .sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));

    const lastValue = datapoints.length
      ? +datapoints[datapoints.length - 1].value
      : startValue.value;

    const todayValue = {
      timestamp: new Date(),
      value: lastValue,
      startValue: +obj.startValue,
    };

    const data = [startValue, ...datapoints, todayValue];

    this.valueArea.datum(data).transition().attr('d', this.area);

    this.valueLine.datum(data).transition().attr('d', this.line);
    this.valueLine.call(styleValueLine.bind(this));

    this.gradient.select('#start').call(styleGradientStart.bind(this));
    this.gradient.select('#stop').call(styleGradientStop.bind(this));

    this.valueIndicators
      .selectAll('path')
      .data(data)
      .join('path')
      .attr('transform', (d) => {
        return (
          `translate(${this.x(d.timestamp)},${this.y(d.value)})`
        );
      })
      .attr('d', this.indicator)
      .call(styleValueIndicators)
  }
}
