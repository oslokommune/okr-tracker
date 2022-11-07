import { select } from 'd3-selection';
import { scaleTime, scaleLinear } from 'd3-scale';
import { max, min } from 'd3-array';
import { line, area, symbol, symbolCircle } from 'd3-shape';
import { axisLeft, axisBottom } from 'd3-axis';
import 'd3-transition';

import i18n from '@/locale/i18n';
import { formatKPIValue } from '@/util/kpiHelpers';
import {
  addValueTooltips,
  initSvg,
  populateLegend,
  resize,
  styleAxisX,
  styleAxisY,
  styleGradientStart,
  styleGradientStop,
  styleValueIndicators,
  styleValueLine,
  CANVAS_PADDING,
  GRAPH_THEMES,
} from './linechart-helpers';

const INDICATOR_SIZE_DEFAULT = 50;
const INDICATOR_SIZE_COMMENT = 450;

export default class LineChart {
  constructor(svgElement, { height, theme, legend, tooltips } = {}) {
    if (!svgElement) {
      throw new Error('svg not defined');
    }

    this.theme = theme || 'blue';
    this.legend = legend || false;
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

    this.target = line()
      .defined((d) => !!d.value)
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
  render({
    startValue,
    targetValue,
    startDate,
    endDate,
    progress,
    targets,
    kpi,
    theme,
  }) {
    if (theme) {
      this.theme = theme;
    }

    let fromValue = startValue;
    let toValue = targetValue;
    const minValue = fromValue = min(progress, d => d.value);

    if (typeof(startValue) !== 'number') {
      fromValue = minValue;
    }
    if (typeof(targetValue) !== 'number') {
      toValue = max(progress, d => d.value);
    }

    const spread = toValue - fromValue;

    /*
     * Pad with 10% of the spread.
     */
    if (typeof(startValue) !== 'number') {
      fromValue -= spread * 0.1;
    }
    if (typeof(targetValue) !== 'number') {
      toValue += spread * 0.1;
    }

    this.x.domain([startDate, endDate]);
    this.y.domain([fromValue, toValue]).nice();

    this.width = this.svg.node().getBoundingClientRect().width;
    resize.call(this);

    const innerWidth = this.width - CANVAS_PADDING.left - CANVAS_PADDING.right;

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

    const datapoints = progress
      .map((d) => ({
        timestamp: d.timestamp.toDate(),
        value: +d.value,
        comment: d?.comment,
        kpi,
        startValue: +minValue,
      }))
      .sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));

    const data = [...datapoints, datapoints.length ? {
      timestamp: new Date(),
      value: +datapoints[datapoints.length - 1].value,
      kpi,
      startValue: +minValue,
    } : []];

    this.valueArea.datum(data).transition().attr('d', this.area);
    this.valueLine.datum(data).transition().attr('d', this.line);
    this.valueLine.call(styleValueLine.bind(this));

    this.gradient.select('#start').call(styleGradientStart.bind(this));
    this.gradient.select('#stop').call(styleGradientStop.bind(this));

    if (targets && targets.length) {
      this.targetLine
        .datum(
          targets.flatMap((target) => [
            { timestamp: target.startDate, value: target.value },
            { timestamp: target.endDate, value: target.value },
            { timestamp: target.endDate, value: null },
          ])
        )
        .transition()
        .attr('d', this.target);
    }

    if (this.legend) {
      const legendItems = [
        {
          label: kpi ? kpi.name : i18n.t('general.value'),
          color: GRAPH_THEMES[this.theme].valueLine,
        },
        ...(targets
          ? [
              {
                label: i18n.t('general.target'),
                color: GRAPH_THEMES[this.theme].targetLine,
              },
            ]
          : []),
      ];
      this.legendContainer.selectAll('g').remove();
      this.legendContainer
        .selectAll('g')
        .data(legendItems)
        .call(populateLegend.bind(this));
    }

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
