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
  styleValueIndicators,
  styleValueLine,
  CANVAS_PADDING,
  GRAPH_COLORS,
} from './linechart-helpers';

const INDICATOR_SIZE_DEFAULT = 50;
const INDICATOR_SIZE_COMMENT = 450;

function formatDate(d, daysBetween) {
  let opts = { year: 'numeric' };

  if (daysBetween <= 6) {
    opts = { day: 'numeric', month: 'long' };
  } else if (daysBetween <= 30 * 6) {
    opts = { day: 'numeric', month: 'short' };
  } else if (daysBetween <= 366) {
    opts = { month: 'long' };
  } else if (daysBetween <= 365 * 5) {
    opts = { month: 'short', year: 'numeric' };
  }

  return d.toLocaleDateString(i18n.locale, opts);
}

export default class LineChart {
  constructor(svgElement, { height, legend, tooltips } = {}) {
    if (!svgElement) {
      throw new Error('svg not defined');
    }

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
      .y0(() => this.y(this.y.domain()[0]));

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
   *   lowest value present in `progress` if unset.
   *
   * `targetValue`: Optional. The end value of the y axis. Will end at the
   *   highest value present in `progress` if unset.
   *
   * `startDate`: The first date on the x axis.
   *
   * `endDate`: The last date on the x axis.
   *
   * `progress`: The array of values to plot.
   *
   * `targets`: A list of target lines to draw. Each element should be an
   *   object specifying `startDate, `endDate`, and `value`.
   *
   * `kpi`: Optional. A KPI to format the y axis for.
   *
   * `initialValue`: Optional. If given, plot a value `initialValue` at
   *   `startDate`.
   */
  render({
    startValue,
    targetValue,
    startDate,
    endDate,
    progress,
    targets,
    kpi,
    initialValue,
  }) {
    let fromValue = startValue;
    let toValue = targetValue;

    if (typeof startValue !== 'number') {
      fromValue = min(progress, (d) => d.value);

      if (targets && targets.length) {
        // Lower the from value if any target is below the min value.
        fromValue = Math.min(
          fromValue,
          min(targets, (t) => t.value)
        );
      }
    }
    if (typeof targetValue !== 'number') {
      toValue = max(progress, (d) => d.value);

      if (targets && targets.length) {
        // Raise the to value if any target is above the max value.
        toValue = Math.max(
          toValue,
          max(targets, (t) => t.value)
        );
      }
    }

    const spread = toValue - fromValue;

    // Pad with 10% of the spread ...
    if (typeof startValue !== 'number') {
      const wasPositive = fromValue >= 0;
      fromValue -= spread * 0.1;

      // ... but don't let it turn from positive to negative.
      if (fromValue < 0 && wasPositive) {
        fromValue = 0;
      }
    }
    if (typeof targetValue !== 'number') {
      toValue += spread * 0.1;
    }

    // To avoid destructively modifying the passed parameters.
    const _startDate = new Date(startDate);
    const _endDate = new Date(endDate);

    _startDate.setHours(0, 0, 0, 0);
    _endDate.setHours(0, 0, 0, 0);
    this.x.domain([_startDate, _endDate]);
    this.y.domain([fromValue, toValue]).nice();

    this.width = this.svg.node().getBoundingClientRect().width;
    resize.call(this);

    const innerWidth = this.width - CANVAS_PADDING.left - CANVAS_PADDING.right;

    const mSecsBetween = _endDate.getTime() - _startDate.getTime();
    const daysBetween = mSecsBetween / (1000 * 60 * 60 * 24);

    this.yAxis
      .transition()
      .call(
        axisLeft(this.y)
          .tickFormat((d) => (kpi ? formatKPIValue(kpi, d, { compact: 'semi' }) : d))
          .ticks(8)
          .tickSizeInner(-innerWidth)
          .tickSizeOuter(0)
          .tickPadding(8)
      )
      .call(styleAxisY);

    this.xAxis
      .transition()
      .call(
        axisBottom(this.x)
          .tickFormat((d) => formatDate(d, daysBetween))
          .ticks(Math.min(Math.ceil(daysBetween) || 1, 5))
      )
      .call(styleAxisX);

    const data = progress
      .map((d) => {
        const timestamp = d.timestamp.toDate();
        timestamp.setHours(0, 0, 0, 0);
        return { timestamp, value: +d.value, comment: d?.comment, kpi };
      })
      .sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));

    if (data.length && typeof initialValue === 'number') {
      data.unshift({ timestamp: _startDate, value: initialValue });
    }

    this.canvas.selectAll('.single-point').remove();

    if (data.length === 1) {
      this.canvas
        .datum(data)
        .append('circle')
        .attr('class', 'single-point')
        .attr('fill', GRAPH_COLORS.valueLine)
        .attr('cx', (d) => this.x(d[0].timestamp))
        .attr('cy', (d) => this.y(d[0].value))
        .attr('r', 4)
        .attr('style', 'pointer-events:none;');
    }

    this.valueArea.datum(data).transition().attr('d', this.area);
    this.valueLine.datum(data).transition().attr('d', this.line);
    this.valueLine.call(styleValueLine.bind(this));

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
    } else {
      this.targetLine.attr('d', null);
    }

    if (this.legend) {
      const legendItems = [
        {
          label: kpi ? i18n.t('kpi.progress') : i18n.t('general.value'),
          color: GRAPH_COLORS.valueLine,
        },
        ...(targets && targets.length
          ? [
              {
                label: i18n.t('general.target'),
                color: GRAPH_COLORS.targetLine,
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
        .attr('transform', (d) => `translate(${this.x(d.timestamp)},${this.y(d.value)})`)
        .attr('d', (d) =>
          this.indicatorSymbol.size(
            d?.comment ? INDICATOR_SIZE_COMMENT : INDICATOR_SIZE_DEFAULT
          )()
        )
        .call(styleValueIndicators);
    }
  }
}
