import { select } from 'd3';
import { saveSvgAsPng } from 'save-svg-as-png';

const headingOffset = 60;

export default function downloadPng(svgRef, filename, title, period) {
  const svg = select(svgRef);
  const canvas = svg.select('.canvas');
  const [minX, minY, width, height] = getViewBoxDimensions(svg);
  const [canvasX, canvasY] = getCanvasTranslation(canvas);

  if (title) {
    svg.attr('viewBox', [minX, minY, width, height + headingOffset].join(' '));
    canvas.attr(
      'transform',
      `translate(${[canvasX, canvasY + headingOffset]})`
    );

    const heading = svg.append('g').classed('heading', true);

    heading
      .append('text')
      .attr('x', 5)
      .attr('y', 25)
      .call(styleText, 18, 500)
      .text(title);

    if (period)
      heading
        .append('text')
        .attr('x', 5)
        .attr('y', 50)
        .call(styleText, 12, 300)
        .text(period);
  }

  svg.select('.indicators').attr('opacity', 0);

  const svgFrame = svgRef.getBoundingClientRect();

  const options = {
    width: svgFrame.width + 50,
    height: svgFrame.height,
  };

  saveSvgAsPng(svgRef, `${filename}.png`, options).finally(() => {
    // Revert changes to SVG
    svg.select('.indicators').attr('opacity', 1);
    svg.select('.heading').remove();
    canvas.attr('transform', `translate(${[canvasX, canvasY]})`);
    svg.attr('viewBox', [minX, minY, width, height].join(' '));
  });
}

function styleText(el, size, weight) {
  el.attr('font-size', size)
    .attr('font-weight', weight)
    .attr('font-family', '"OsloSans", Helvetica, Arial, sans-serif')
    .attr('fill', 'var(--color-grey-600)');
}

function getViewBoxDimensions(svg) {
  return svg
    .attr('viewBox')
    .split(' ')
    .map((str) => Number(str.trim()));
}

function getCanvasTranslation(canvas) {
  return canvas
    .attr('transform')
    .split('(')[1]
    .split(')')[0]
    .split(',')
    .map((str) => Number(str.trim()));
}
