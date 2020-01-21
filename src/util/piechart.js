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

import { getTimeProgression, getProgression } from '@/util/helpers';

export default class Pie {
  /**
   * Initialize the SVG and create the necessary DOM elements
   */
  constructor(svg) {
    this.svg = select(svg).call(initSvg);
    this.inner = this.svg.append('g').call(initGroup, 'inner');
    this.outer = this.svg.append('g').call(initGroup, 'outer');
    this.percentText = this.svg.append('text').call(initPercentText);
    this.outer.call(initOuterGroup);
    this.pie = pie().sort(null);
  }

  /**
   * Update the visualisation using the provided data
   */
  render(obj, quarter) {
    const progress = obj.progressions[quarter.name] || 0;
    const time = getTimeProgression(quarter.name);

    // Set up the data for the inner and outer arcs
    const innerArcs = this.pie([progress, 1 - progress]);
    const outerArcs = this.pie([time, 1 - time]);

    // Use the arc data to update the arcs
    this.inner.call(updateInnerArcs, innerArcs);
    this.outer.call(updateOuterArcs, outerArcs);

    // Position the 'today' marker and text using the provided angle
    const todayAngle = outerArcs[0].endAngle;
    this.outer.select('line').call(updateTodayLine, todayAngle);
    this.outer.select('text').call(updateTodayTextPosition, todayAngle);

    // Update the percentage text by tweening to the provided value
    this.percentText.call(updatePercentText, progress);
  }
}
