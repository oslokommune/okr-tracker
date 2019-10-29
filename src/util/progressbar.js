import { scaleLinear, select } from 'd3';
import {
  initBackground,
  initBar,
  initCurrentVal,
  initStartVal,
  initSvg,
  initTargetVal,
  initUnit,
  width,
  barPadding,
} from './graph-helpers';

export default class Progressbar {
  constructor(svg) {
    this.svg = select(svg).call(initSvg);
    this.bg = this.svg.append('rect').call(initBackground);
    this.bar = this.svg.append('rect').call(initBar);
    this.unit = this.svg.append('text').call(initUnit);
    this.startVal = this.svg.append('text').call(initStartVal);
    this.targetVal = this.svg.append('text').call(initTargetVal);
    this.currentVal = this.svg.append('g').call(initCurrentVal);

    this.x = scaleLinear()
      .range([0, width - barPadding * 2])
      .clamp(true);
  }

  render(obj) {
    this.unit.text(obj.unit);
    this.startVal.text(obj.start_value);
    this.targetVal.text(obj.target_value);

    this.x.domain([obj.start_value, obj.target_value]);

    const val = +obj.current_value || obj.start_value || 0;

    this.currentVal
      .select('text')
      .text(val)
      .attr('text-anchor', () => {
        return this.x(val) < 50 ? 'start' : this.x(val) > width - 50 ? 'end' : 'middle';
      });

    this.currentVal.attr('transform', `translate(${this.x(val)}, 0)`);

    this.bar.attr('width', this.x(val));
  }
}
