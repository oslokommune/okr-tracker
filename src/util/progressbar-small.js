import { scaleLinear, select } from 'd3';
import { formatPercent } from '@/util/pie-helpers';
import { initBackground, initBar, initSvg, resize, setWidth, initValueText } from '@/util/progressbar-helpers';

export default class Progressbar {
  constructor(svg) {
    this.compressed = true;
    this.svg = select(svg).call(initSvg.bind(this));
    this.bg = this.svg.append('rect').call(initBackground.bind(this));
    this.bar = this.svg.append('rect').call(initBar.bind(this));

    this.x = scaleLinear().clamp(true);
    this.valueText = this.svg.append('text').call(initValueText.bind(this));
  }

  render(obj) {
    this.width = this.svg.node().getBoundingClientRect().width;
    resize.call(this);

    this.x.domain([obj.startValue, obj.targetValue]);
    const val = +obj.currentValue || obj.startValue || 0;

    this.valueText.text(formatPercent(obj.progression)).attr('font-weight', this.isDone ? 600 : 300);

    this.bar.call(setWidth.bind(this), val);
  }

  darkmode() {}
}
