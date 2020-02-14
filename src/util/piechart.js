import { select, pie } from 'd3';

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
} from './pie-helpers';

import { getTimeProgression } from './helpers';

export default class Pie {
  /**
   * Initialize the SVG and create the necessary DOM elements
   */
  constructor(svg, darkmode = false) {
    this.darkmode = darkmode;
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
  render(obj, quarter) {
    if (!obj || !quarter) return;

    const progress = obj && obj.progressions && obj.progressions[quarter.name] ? obj.progressions[quarter.name] : 0;
    const time = getTimeProgression(quarter.name);

    // Set up the data for the inner and outer arcs
    const innerArcs = this.pie([progress, 1 - progress]);
    const outerArcs = this.pie([time, 1 - time]);

    // Use the arc data to update the arcs
    this.inner.call(updateInnerArcs.bind(this), innerArcs);
    this.outer.call(updateOuterArcs.bind(this), outerArcs);

    // Position the 'today' marker and text using the provided angle
    const todayAngle = outerArcs[0].endAngle;
    this.outer.select('line').call(updateTodayLine, todayAngle);
    this.outer.select('text').call(updateTodayTextPosition, todayAngle);

    // Update the percentage text by tweening to the provided value
    this.percentText.call(updatePercentText, progress);
  }
}
