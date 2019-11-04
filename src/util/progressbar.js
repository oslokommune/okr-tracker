import { scaleLinear, select } from 'd3';
import {
  initBackground,
  initBar,
  initCurrentVal,
  initStartVal,
  initSvg,
  initTargetVal,
  initUnit,
  setWidth,
  resize,
} from './progressbar-helpers';

export default class Progressbar {
  constructor(svg) {
    this.svg = select(svg).call(initSvg.bind(this));
    this.bg = this.svg.append('rect').call(initBackground.bind(this));
    this.bar = this.svg.append('rect').call(initBar.bind(this));
    this.unit = this.svg.append('text').call(initUnit.bind(this));
    this.startVal = this.svg.append('text').call(initStartVal);
    this.targetVal = this.svg.append('text').call(initTargetVal);
    this.currentVal = this.svg.append('g').call(initCurrentVal);
    this.isDark = false;

    this.x = scaleLinear().clamp(true);
  }

  render(obj) {
    this.width = this.svg.node().getBoundingClientRect().width;
    resize.call(this);

    this.unit.text(obj.unit);
    this.startVal.text(obj.start_value);
    this.targetVal.text(obj.target_value);

    this.x.domain([obj.start_value, obj.target_value]);
    const val = +obj.current_value || obj.start_value || 0;

    this.currentVal
      .select('text')
      .text(val)
      .attr('text-anchor', () => {
        return this.x(val) < 50 ? 'start' : this.x(val) > this.width - 50 ? 'end' : 'middle';
      });

    this.currentVal.attr('transform', `translate(${this.x(val)}, 0)`);

    this.bar.call(setWidth.bind(this), val);
  }

  darkmode() {
    this.isDark = true;

    this.bg.attr('fill', 'white').attr('fill-opacity', 0.2);
    this.bar.attr('fill', '#777777');
    this.svg
      .selectAll('text')
      .attr('fill', 'white')
      .attr('fill-opacity', 0.8);

    this.currentVal.select('rect').attr('fill', '#020218');
  }
}
