import { select, scaleTime, scaleLinear, axisLeft, axisBottom, extent, line, area } from 'd3';
import { initSvg, resize } from './linechart-helpers';

export default class LineChart {
  constructor(svgElement) {
    if (!svgElement) {
      throw new Error('svg not defined');
    }

    select(svgElement).selectAll('*').remove();

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

    const startDate =
      period.startDate && period.startDate.toDate ? period.startDate.toDate() : new Date(period.startDate);
    const endDate = period.endDate && period.endDate.toDate ? period.endDate.toDate() : new Date(period.endDate);

    this.x.domain([startDate, endDate]);
    this.y.domain(extent([obj.startValue, obj.targetValue]));

    this.yAxis.transition().call(axisLeft(this.y));
    this.xAxis.transition().call(axisBottom(this.x).ticks(4));

    this.today.attr('x1', this.x(new Date())).attr('x2', this.x(new Date())).attr('y2', 0).attr('y1', this.innerHeight);

    const startValue = {
      timestamp: period.startDate.toDate(),
      value: +obj.startValue,
      startValue: +obj.startValue,
    };

    const datapoints = progressionList
      .map(d => {
        return {
          timestamp: d.timestamp.toDate(),
          value: +d.value,
          startValue: +obj.startValue,
        };
      })
      .sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));

    const lastValue = datapoints.length ? +datapoints[datapoints.length - 1].value : startValue.value;

    const todayValue = {
      timestamp: new Date(),
      value: lastValue,
      startValue: +obj.startValue,
    };

    const data = [startValue, ...datapoints, todayValue];

    this.valueArea.datum(data).transition().attr('d', this.area);

    this.valueLine.datum(data).transition().attr('d', this.line);
  }
}
