import { select, scaleTime, scaleLinear, axisLeft, axisBottom, extent, line, curveStepAfter } from 'd3';

import { initSvg, resize } from './linechart-helpers';
import { getDateSpanFromQuarter } from './helpers';

// import { getTimeProgression, getProgression } from './helpers';

export default class Linechart {
  constructor(svgElement) {
    select(svgElement).call(initSvg.bind(this));

    this.x = scaleTime().clamp(true);
    this.y = scaleLinear().nice();

    this.line = line()
      .x(d => this.x(d.timestamp))
      .y(d => this.y(d.value))
      .curve(curveStepAfter);
  }

  render(obj, period) {
    this.period = period;
    this.obj = obj;

    this.width = this.svg.node().getBoundingClientRect().width;
    resize.call(this);

    const dates = Object.values(getDateSpanFromQuarter(period));
    this.x.domain(dates);
    this.y.domain(extent([obj.start_value, obj.target_value]));

    this.yAxis.call(axisLeft(this.y));
    this.xAxis.call(axisBottom(this.x));

    const startValue = {
      timestamp: dates[0],
      value: +obj.start_value,
    };

    const datapoints = obj.children.map(d => ({
      timestamp: new Date(d.timestamp),
      value: +d.value,
    }));

    const data = [startValue, ...datapoints].sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));

    this.valueLine.datum(data).attr('d', this.line);
  }
}
