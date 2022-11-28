import { select } from 'd3-selection';
import { pie } from 'd3-shape';

import {
  initSvg,
  initGroup,
  initPercentText,
  initOuterGroup,
  updateInnerArcs,
  updateOuterArcs,
  updateTodayLine,
  updateTodayTextPosition,
  updatePercentText,
  colors,
} from './pie-helpers';

import { getTimeProgression } from './helpers';

export default class Pie {
  /**
   * Initialize the SVG and create the necessary DOM elements
   */
  constructor(svg, { darkmode, dimmed, colorMode }) {
    this.dimmed = dimmed || false;
    this.colorMode = colorMode || 'blue';
    this.darkmode = darkmode || false;
    this.svg = select(svg).call(initSvg.bind(this));
    this.canvas = this.svg.append('g').classed('canvas', true);
    this.inner = this.canvas.append('g').call(initGroup, 'inner');
    this.outer = this.canvas.append('g').call(initGroup, 'outer');
    this.percentText = this.canvas.append('text').call(initPercentText.bind(this));
    this.outer.call(initOuterGroup.bind(this));
    this.pie = pie().sort(null);
  }

  /**
   * Update the visualisation using the provided data
   */
  render(progression, period, colorMode) {
    this.colorMode = colorMode;
    const time = getTimeProgression(period);

    // Set up the data for the inner and outer arcs
    const innerArcs = this.pie([progression, 1 - progression]);
    const outerArcs = this.pie([time, 1 - time]);

    // Use the arc data to update the arcs
    this.inner.call(updateInnerArcs.bind(this), innerArcs);
    this.outer.call(updateOuterArcs.bind(this), outerArcs);

    // Position the 'today' marker and text using the provided angle
    const todayAngle = outerArcs[0].endAngle;
    this.outer.select('line').call(updateTodayLine, todayAngle);
    this.outer.select('text').call(updateTodayTextPosition, todayAngle);
    this.outer
      .select('text')
      .attr('fill', this.darkmode ? 'white' : colors[this.colorMode].innerDone);
    // Update the percentage text by tweening to the provided value
    this.percentText.call(updatePercentText.bind(this), progression);
  }
}
