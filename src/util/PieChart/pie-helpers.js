import { select } from 'd3-selection';
import { arc } from 'd3-shape';
import { format } from 'd3-format';
import { interpolate } from 'd3-interpolate';
import { easeCircleOut } from 'd3-ease';
import 'd3-transition';

const size = 250;
const padding = 50;
const radius = (size - padding * 2) / 2;
const duration = 600;
const ease = easeCircleOut;
export const colors = {
  blue: {
    innerDone: '#2A2859',
    innerFull: '#a2a2a2',
    outer: '#6ee9ff',
    dimmed: '#c7c7c7',
  },
  green: {
    innerDone: '#034b45',
    innerFull: '#a2a2a2',
    outer: '#43f8b6',
    dimmed: '#c7c7c7',
  },
};

export const formatPercent = format('.0%');

function initSvg(el) {
  el.attr('viewBox', `0 0 ${size} ${size / 1.2}`)
    .attr('width', '100%')
    .attr('preserveAspectRatio', 'xMidYMid');
}

// Set up the arc generators
const innerArc = arc()
  .innerRadius(radius * 0.62)
  .outerRadius(radius - 1);

const outerArc = arc()
  .innerRadius(radius + 2)
  .outerRadius(radius + 6);

// Helper for naming and centering a group element
function initGroup(g, name = 'group') {
  g.classed(name, true).attr(
    'transform',
    `translate(${size / 2}, ${size / 2 - size * 0.1})`
  );
}

// Initializes the outer group element by appending the neccessary elements within
function initOuterGroup(el) {
  el.append('g');
  el.append('line').attr('stroke', this.darkmode ? 'white' : 'black');

  el.append('text')
    .attr('font-size', 14)
    .attr('y', 5)
    .text('I dag')
    .attr('fill', this.darkmode ? 'white' : colors[this.colorMode].innerDone);
}

// Positions and styles the percentage text element
function initPercentText(el) {
  el.classed('percent', true)
    .attr('transform', `translate(${size / 2}, ${size / 2 - size * 0.1})`)
    .attr('text-anchor', 'middle')
    .attr('font-size', 24)
    .attr('font-weight', 'bold')
    .attr('fill', this.darkmode ? 'white' : colors[this.colorMode].innerDone)
    .attr('y', 8);
}

// Updates the position and anchor-direction of the today text label
function updateTodayTextPosition(el, targetAngle) {
  el.text(() => {
    if (targetAngle <= 0) return 'Ikke startet';
    if (targetAngle >= Math.PI * 2) return 'Fullført';
    return 'I dag';
  })
    .transition()
    .duration(duration)
    .ease(ease)
    .attrTween('todayText', (d, i, j) => {
      const angleInterpolator = interpolate(j[i].current || 0, targetAngle);

      return function (t) {
        const angle = angleInterpolator(t);
        const pos = getPosFromAngle(angle - Math.PI / 2, radius + 18);
        const anchor = angle > Math.PI ? 'end' : 'start';
        j[i].current = angle;
        el.attr('transform', `translate(${pos})`).attr('text-anchor', anchor);
      };
    });
}

// Tweens text to the provided number
function updatePercentText(el, tweenTo) {
  el.transition()
    .duration(duration)
    .ease(ease)
    .attrTween('text', (d, i, j) => {
      const counter = interpolate(j[i].current || 0, tweenTo);
      return (t) => {
        j[i].current = counter(t);
        select(j[i]).text(formatPercent(counter(t) || 0));
      };
    })
    .attr('fill', this.darkmode ? 'white' : colors[this.colorMode].innerDone);
}

// Draws/redraws the shape of the inner arc
function updateInnerArcs(el, data) {
  el.selectAll('path')
    .data(data)
    .join('path')
    .attr('fill', (d, i) => {
      if (this.darkmode) {
        return colors[this.colorMode].outer;
      }
      if (this.dimmed) {
        return i === 0 ? colors[this.colorMode].dimmed : colors[this.colorMode].innerFull;
      }
      return i === 0
        ? colors[this.colorMode].innerDone
        : colors[this.colorMode].innerFull;
    })
    .attr('fill-opacity', (d, i) => (i === 0 ? 1 : 0.15))
    .transition()
    .duration(duration)
    .ease(ease)
    .attrTween('d', (d, i, j) => arcTween(d, j[i], innerArc));
}

// Draws/redraws the shape of the outer arc
function updateOuterArcs(el, data) {
  el.select('g')
    .selectAll('path')
    .data(data)
    .join('path')
    .attr('fill', () => (this.darkmode ? 'white' : colors[this.colorMode].outer))
    .attr('fill-opacity', (d, i) => (i === 0 ? 1 : 0))
    .transition()
    .duration(duration)
    .ease(ease)
    .attrTween('d', (d, i, j) => arcTween(d, j[i], outerArc));
}

// Animates the position of the today line
function updateTodayLine(el, targetAngle) {
  el.transition()
    .duration(duration)
    .ease(ease)
    .attrTween('todayText', (d, i, j) => {
      const angleInterpolator = interpolate(j[i].current || 0, targetAngle);

      return (t) => {
        const angle = angleInterpolator(t);
        j[i].current = angle;

        const [x1, y1] = getPosFromAngle(angle - Math.PI / 2, radius + 2);
        const [x2, y2] = getPosFromAngle(angle - Math.PI / 2, radius + 11);

        el.attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2);
      };
    });
}

// Tweens arc paths using the provided arc generator and target angles
function arcTween(target, el, generator) {
  const i = interpolate(el.current || { startAngle: 0, endAngle: 0 }, target);
  return (t) => {
    el.current = i(t);
    return generator(i(t));
  };
}

// Converts an angle and radius to coordinates
function getPosFromAngle(angle, radiusNumber = 1) {
  const x = Math.cos(angle) * radiusNumber;
  const y = Math.sin(angle) * radiusNumber;

  return [x, y];
}

export {
  initSvg,
  initGroup,
  initPercentText,
  initOuterGroup,
  updateInnerArcs,
  updateOuterArcs,
  updateTodayLine,
  updateTodayTextPosition,
  updatePercentText,
};
