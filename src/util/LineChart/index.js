import { select } from 'd3-selection';
import { scaleTime, scaleLinear } from 'd3-scale';
import { max, min } from 'd3-array';
import { line, area, symbol, symbolCircle } from 'd3-shape';
import { axisLeft, axisBottom } from 'd3-axis';
import 'd3-transition';

import { formatKPIValue } from '@/util/kpiHelpers';
import {
  addValueTooltips,
  initSvg,
  padding,
  resize,
  styleAxisX,
  styleAxisY,
  styleGradientStart,
  styleGradientStop,
  styleValueIndicators,
  styleValueLine,
} from './linechart-helpers';

const INDICATOR_SIZE_DEFAULT = 50;
const INDICATOR_SIZE_COMMENT = 450;

export default class LineChart {
  constructor(svgElement, { height, theme, tooltips } = {}) {
    if (!svgElement) {
      throw new Error('svg not defined');
    }

    this.theme = theme || 'blue';
    this.tooltips = tooltips || false;

    select(svgElement).selectAll('*').remove();

    select(svgElement).call(initSvg.bind(this));

    this.height = height || 350;
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

    this.indicatorSymbol = symbol(symbolCircle);
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

    if (typeof(startValue) !== 'number') {
      startValue = min(progress, d => d.value);
    }

    if (typeof(targetValue) !== 'number') {
      targetValue = max(progress, d => d.value);
    }

    this.x.domain([startDate, endDate]);
    this.y.domain([startValue, targetValue]).nice();

    this.width = this.svg.node().getBoundingClientRect().width;
    resize.call(this);

    const innerWidth = this.width - padding.left - padding.right;

    this.yAxis
      .transition()
      .call(
        axisLeft(this.y).tickFormat((d) =>
          kpi ? formatKPIValue(kpi, d, { compact: 'semi' }) : d
        )
        .ticks(8)
        .tickSizeInner(-innerWidth)
        .tickSizeOuter(0)
        .tickPadding(8)
      )
      .call(styleAxisY);
    this.xAxis.transition().call(axisBottom(this.x).ticks(6)).call(styleAxisX);

    const firstValue = {
      timestamp: startDate,
      value: +startValue,
      kpi,
      startValue: +startValue,
    };

    const datapoints = progress
      .map((d) => ({
        timestamp: d.timestamp.toDate(),
        value: +d.value,
        comment: d?.comment,
        kpi,
        startValue: +startValue,
      }))
      .sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));

    const lastValue = datapoints.length
      ? +datapoints[datapoints.length - 1].value
      : firstValue.value;

    const todayValue = {
      timestamp: new Date(),
      value: lastValue,
      kpi,
      startValue: +startValue,
    };

    const data = [firstValue, ...datapoints, todayValue];

    this.valueArea.datum(data).transition().attr('d', this.area);

    this.valueLine.datum(data).transition().attr('d', this.line);
    this.valueLine.call(styleValueLine.bind(this));

    this.gradient.select('#start').call(styleGradientStart.bind(this));
    this.gradient.select('#stop').call(styleGradientStop.bind(this));

    if (this.tooltips) {
      this.valueIndicators
        .call(addValueTooltips.bind(this))
        .selectAll('path')
        .data(data)
        .join('path')
        .attr(
          'transform',
          (d) => `translate(${this.x(d.timestamp)},${this.y(d.value)})`
        )
        .attr('d', (d) =>
          this.indicatorSymbol.size(
            d?.comment ? INDICATOR_SIZE_COMMENT : INDICATOR_SIZE_DEFAULT
          )()
        )
        .call(styleValueIndicators);
    }
  }
}
