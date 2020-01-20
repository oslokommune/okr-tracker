import { select, scaleTime, scaleLinear, axisLeft, axisBottom, extent, line, curveStepAfter } from 'd3';

import { initSvg, resize } from './linechart-helpers';
import { getDateSpanFromQuarter } from './helpers';

// import { getTimeProgression, getProgression } from './helpers';

export default class Linechart {
  constructor(svgElement) {
    if (!svgElement) {
      throw new Error('svg not defined');
    }

    select(svgElement)
      .selectAll('*')
      .remove();

    select(svgElement).call(initSvg.bind(this));

    this.height = 250;
    this.x = scaleTime().clamp(true);
    this.y = scaleLinear().nice();

    this.line = line()
      .x(d => this.x(d.timestamp))
      .y(d => this.y(d.value))
      .curve(curveStepAfter);
  }

  render(obj, period, foo) {
    this.period = period;
    this.obj = obj;

    this.width = this.svg.node().getBoundingClientRect().width;
    resize.call(this);

    const dates = Object.values(getDateSpanFromQuarter(period));

    this.x.domain(dates);
    this.y.domain(extent([obj.start_value, obj.target_value]));

    this.yAxis.transition().call(axisLeft(this.y));
    this.xAxis.transition().call(axisBottom(this.x).ticks(4));

    const startValue = {
      timestamp: dates[0],
      value: +obj.start_value,
    };

    const datapoints = foo.map(d => {
      return {
        timestamp: new Date(d.date),
        value: +d.value,
      };
    });

    const data = [startValue, ...datapoints].sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));

    this.valueLine
      .datum(data)
      .transition()
      .attr('d', this.line);
  }
}
