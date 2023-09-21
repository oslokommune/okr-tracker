import { select } from 'd3';
import { saveSvgAsPng, svgAsPngUri } from 'save-svg-as-png';

const headingOffset = 60;
const extraPaddingRight = 50;

export default function downloadPng(svgRef, filename, title, period) {
  const svg = select(svgRef);
  const canvas = svg.select('.canvas');
  const [minX, minY, width, height] = getViewBoxDimensions(svg);
  const [canvasX, canvasY] = getCanvasTranslation(canvas);

  if (title) {
    svg.attr('viewBox', [minX, minY, width, height + headingOffset].join(' '));
    canvas.attr('transform', `translate(${[canvasX, canvasY + headingOffset]})`);

    const heading = svg.append('g').classed('heading', true);

    heading
      .append('text')
      .attr('x', 5)
      .attr('y', 25)
      .call(styleText, 18, 500)
      .attr('fill', 'var(--color-primary)')
      .text(title);

    if (period) {
      heading
        .append('text')
        .attr('x', 5)
        .attr('y', 50)
        .call(styleText, 12, 300)
        .attr('fill', 'var(--color-grayscale-60)')
        .text(period);
    }
  }

  svg.select('.indicators').attr('opacity', 0);

  const svgFrame = svgRef.getBoundingClientRect();

  const options = {
    width: svgFrame.width + extraPaddingRight,
    height: svgFrame.height,
    backgroundColor: '#ffffff',
  };

  // Force the PNG to be rendered twice, but downloaded only once. This is a
  // workaround for Safari not loading linked assets on first download attempt.
  // See https://github.com/exupero/saveSvgAsPng/issues/223
  svgAsPngUri(svgRef).then(() => {
    saveSvgAsPng(svgRef, `${filename}.png`, options).finally(() => {
      // Revert changes to SVG
      svg.select('.indicators').attr('opacity', 1);
      svg.select('.heading').remove();
      canvas.attr('transform', `translate(${[canvasX, canvasY]})`);
      svg.attr('viewBox', [minX, minY, width, height].join(' '));
    });
  });
}

function styleText(el, size, weight) {
  el.attr('font-size', size)
    .attr('font-weight', weight)
    .attr('font-family', '"Oslo Sans", Helvetica, Arial, sans-serif');
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
