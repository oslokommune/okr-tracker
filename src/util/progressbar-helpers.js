export const fontSize = 12;
export const radius = 4;
export const barPadding = 3;
export const barHeight = 10;

export const colors = {
  purple: '#2A2859',
  yellow: '#F9C66B',
  grey: '#EBEBEB',
};

export function initSvg(el) {
  this.paddingLeft = this.compressed ? 80 : 0;
  this.height = this.compressed ? 26 : 43;

  el.style('width', '100%').attr('height', this.height);
}

export function initBar(el) {
  const y = this.compressed ? 5 : 14 + barPadding;
  const x = barPadding + this.paddingLeft;

  el.attr('height', 10)
    .attr('x', x)
    .attr('rx', radius - 2)
    .attr('y', y);
}

export function initBackground(el) {
  const y = this.compressed ? 0 : 14;
  const x = this.paddingLeft;

  el.attr('height', 16).attr('fill', colors.grey).attr('x', x).attr('rx', radius).attr('y', y);
}

export function initUnit(el) {
  el.attr('font-size', fontSize).attr('y', fontSize - 3);
}

export function initStartVal(el) {
  el.attr('font-size', fontSize).attr('y', 42);
}

export function initTargetVal(el) {
  el.attr('font-size', fontSize).attr('y', 42).attr('text-anchor', 'end');
}

export function initCurrentVal(el) {
  el.append('rect').attr('y', 31).attr('fill', 'white').attr('height', 12);

  el.append('text')
    .attr('text-anchor', 'middle')
    .attr('font-size', fontSize)
    .style('font-weight', 'bold')
    .text('100')
    .attr('y', 42);
}

export function setWidth(el, val) {
  const width = this.x(val);
  this.isDone = width >= this.x.range()[1];

  let fill;

  if (this.isDark) {
    fill = '#777';
  } else if (this.isDone) {
    fill = colors.purple;
  } else {
    fill = colors.yellow;
  }

  el.attr('width', width).attr('fill', fill);
}

export function resize() {
  const { width } = this;
  this.x.range([0, width - this.paddingLeft - barPadding * 2]);
  this.svg.attr('viewBox', `0 0 ${width} ${this.height}`);
  this.bg.attr('width', width - this.paddingLeft);

  if (!this.compressed) {
    this.targetVal.attr('x', width);
  }
}

export function initValueText(el) {
  el.attr('y', 18)
    .attr('x', this.paddingLeft - 12)
    .attr('text-anchor', 'end');
}
