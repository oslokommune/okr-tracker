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
    if (this.width < 10) return;

    resize.call(this);

    this.unit.text(obj.unit);
    this.startVal.text(obj.startValue);
    this.targetVal.text(obj.targetValue);

    this.x.domain([obj.startValue, obj.targetValue]);
    const val = +obj.currentValue || obj.startValue || 0;

    this.currentVal
      .select('text')
      .text(val)
      .attr('text-anchor', () => {
        if (this.x(val) < 50) return 'start';
        if (this.x(val) > this.width - 50) return 'end';
        return 'middle';
      });

    this.currentVal.select('rect').each((d, i, j) => {
      const el = j[i];

      const textEl = el.nextElementSibling;
      const { width, x } = textEl.getBBox();

      select(el).attr('x', x - 6);
      select(el).attr('width', width + 12);
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
