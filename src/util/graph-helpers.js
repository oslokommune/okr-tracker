export const height = 70;
export const width = 350;
export const fontSize = 15;
export const radius = 4;
export const barPadding = 5;

export const paddingLeft = 72;

export const colors = {
  purple: '#2A2859',
  yellow: '#F9C66B',
  grey: '#EBEBEB',
};

export function initSvg(el) {
  el.style('width', '100%')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('height', height);
}

export function initSvgSmall(el) {
  const height = 26;

  el.style('width', '100%')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('height', height);
}

export function initBar(el) {
  const y = this.compressed ? 5 : 20 + barPadding;
  const x = this.compressed ? barPadding + paddingLeft : barPadding;

  el.attr('height', 16)
    .attr('x', x)
    .attr('rx', radius - 2)
    .attr('y', y);
}

export function initBackground(el) {
  const y = this.compressed ? 0 : 20;
  const x = this.compressed ? paddingLeft : 0;
  const w = this.compressed ? width - paddingLeft : width;

  el.attr('height', 26)
    .attr('width', w)
    .attr('fill', colors.grey)
    .attr('x', x)
    .attr('rx', radius)
    .attr('y', y);
}

export function initUnit(el) {
  el.attr('font-size', fontSize).attr('y', 10);
}

export function initStartVal(el) {
  el.attr('font-size', fontSize).attr('y', 64);
}

export function initTargetVal(el) {
  el.attr('font-size', fontSize)
    .attr('y', 64)
    .attr('x', width)
    .attr('text-anchor', 'end');
}

export function initCurrentVal(el) {
  el.append('rect')
    .attr('y', 48)
    .attr('x', -10)
    .attr('fill', 'white')
    .attr('width', 20)
    .attr('height', 20);

  el.append('text')
    .attr('text-anchor', 'middle')
    .attr('font-size', fontSize)
    .style('font-weight', 'bold')
    .text('100')
    .attr('y', 64);
}

export function setWidth(el, val) {
  const width = this.x(val);
  const isDone = val / this.x.domain()[1] === 1;
  el.attr('width', width).attr('fill', isDone ? colors.purple : colors.yellow);
}
