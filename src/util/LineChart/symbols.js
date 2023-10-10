// eslint-disable-next-line import/prefer-default-export
export function addCommentSymbol(el) {
  const fill = 'var(--graph-symbol-fill, var(--color-blue-light))';
  const color = 'var(--graph-symbol-color, var(--color-blue-dark))';

  const pattern = el
    .append('pattern')
    .attr('id', 'comment-symbol')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', '21')
    .attr('height', '21')
    .attr('x', '14')
    .attr('y', '15')
    .attr('viewBox', '0 0 25 25');

  pattern.append('rect').attr('width', '100%').attr('height', '100%').attr('fill', fill);

  pattern
    .append('path')
    .attr(
      'd',
      'M8.53125 4.75C8.53125 5.302 8.97925 5.75 9.53125 5.75C10.0833 5.75 10.5312 5.302 10.5312 4.75C10.5312 4.198 10.0833 3.75 9.53125 3.75C8.97925 3.75 8.53125 4.198 8.53125 4.75Z'
    )
    .attr('fill', color);

  pattern
    .append('path')
    .attr(
      'd',
      'M12.2812 5.75C11.7292 5.75 11.2812 5.302 11.2812 4.75C11.2812 4.198 11.7292 3.75 12.2812 3.75C12.8333 3.75 13.2812 4.198 13.2812 4.75C13.2812 5.302 12.8333 5.75 12.2812 5.75Z'
    )
    .attr('fill', color);

  pattern
    .append('path')
    .attr(
      'd',
      'M5.71875 4.75C5.71875 5.302 6.16675 5.75 6.71875 5.75C7.27075 5.75 7.71875 5.302 7.71875 4.75C7.71875 4.198 7.27075 3.75 6.71875 3.75C6.16675 3.75 5.71875 4.198 5.71875 4.75Z'
    )
    .attr('fill', color);

  pattern
    .append('path')
    .attr('fill-rule', 'evenodd')
    .attr('clip-rule', 'evenodd')
    .attr(
      'd',
      'M3 0H16V9.5H11.0195L9.5 11.0196L7.98 9.5H3V0ZM10.6054 8.5H15V1H4V8.5H8.39461L9.5 9.605L10.6054 8.5Z'
    )
    .attr('fill', color);

  pattern
    .append('path')
    .attr(
      'd',
      'M2 3V4H1V12.3125H5.39461L6.5 13.4175L7.60539 12.3125H12V10.5H13V13.3125H8.0195L6.5 14.8321L4.98 13.3125H0V3H2Z'
    )
    .attr('fill', color);
}
