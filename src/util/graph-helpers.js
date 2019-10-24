export const height = 70;
export const width = 350;
export const fontSize = 15;
export const radius = 4;
export const barPadding = 5;

export const colors = {
  yellow: '#F9C66B',
  grey: '#EBEBEB',
};

export function initSvg(el) {
  el.style('width', '100%')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('height', height);
}

export function initBar(el) {
  el.attr('height', 16)
    .attr('x', barPadding)
    .attr('rx', radius - 2)
    .attr('y', 20 + barPadding)
    .attr('fill', colors.yellow);
}

export function initBackground(el) {
  el.attr('height', 26)
    .attr('width', width)
    .attr('fill', colors.grey)
    .attr('rx', radius)
    .attr('y', 20);
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
