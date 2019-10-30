import { scaleLinear, select } from 'd3';
import { initBackground, initBar, initSvgSmall, width, barPadding, paddingLeft, setWidth } from './graph-helpers';

export default class Progressbar {
  constructor(svg) {
    this.compressed = true;
    this.svg = select(svg).call(initSvgSmall.bind(this));
    this.bg = this.svg.append('rect').call(initBackground.bind(this));
    this.bar = this.svg.append('rect').call(initBar.bind(this));

    this.x = scaleLinear()
      .range([0, width - paddingLeft - barPadding * 2])
      .clamp(true);
  }

  render(obj) {
    this.x.domain([obj.start_value, obj.target_value]);

    const val = +obj.current_value || obj.start_value || 0;

    this.bar.call(setWidth.bind(this), val);
  }
}
