import { select, scaleTime, scaleLinear, axisLeft, axisBottom, extent, line, area } from 'd3';
import { initSvg, resize } from '@/util/linechart-helpers';
import { getDateSpanFromQuarter } from '@/util/helpers';

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

    this.area = area()
      .x0(d => this.x(d.timestamp))
      .x1(d => this.x(d.timestamp))
      .y1(d => this.y(d.value))
      .y0(d => this.y(d.startValue));

    this.line = line()
      .x(d => this.x(d.timestamp))
      .y(d => this.y(d.value));
  }

  render(obj, period, progressionList) {
    this.period = period;
    this.obj = obj;

    this.width = this.svg.node().getBoundingClientRect().width;
    resize.call(this);

    const dates = Object.values(getDateSpanFromQuarter(period));

    this.x.domain(dates);
    this.y.domain(extent([obj.startValue, obj.targetValue]));

    this.yAxis.transition().call(axisLeft(this.y));
    this.xAxis.transition().call(axisBottom(this.x).ticks(4));

    this.today
      .attr('x1', this.x(new Date()))
      .attr('x2', this.x(new Date()))
      .attr('y2', 0)
      .attr('y1', this.innerHeight);

    const startValue = {
      timestamp: dates[0],
      value: +obj.startValue,
      startValue: +obj.startValue,
    };

    const datapoints = progressionList.map(d => {
      return {
        timestamp: new Date(d.date),
        value: +d.value,
        startValue: +obj.startValue,
      };
    });

    const data = [startValue, ...datapoints].sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));

    data.push({
      timestamp: new Date(),
      value: +data[data.length - 1].value,
      startValue: +obj.startValue,
    });

    this.valueArea
      .datum(data)
      .transition()
      .attr('d', this.area);

    this.valueLine
      .datum(data)
      .transition()
      .attr('d', this.line);
  }
}
