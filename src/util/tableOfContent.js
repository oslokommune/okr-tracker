import { stratify } from 'd3';

/**
 * Finds the parent node for the provided node
 * by matching its level with its leading nodes in
 * the list.
 * @param {Object} node -
 * @param {Number} index - Index of current node
 * @param {Array} list - List of nodes
 * @returns {String} - Parent id
 */
function getParent(node, index, list) {
  let parentId;

  for (let i = 0; i < index; i += 1) {
    if (+list[i][1] < +node[1]) {
      parentId = list[i][2]; // eslint-disable-line
    } else if (+list[i][1] > +node[1]) {
      parentId = null;
    }
  }

  return parentId || 'root';
}

/**
 * Finds all the H-elements in the provided HTML-string
 * @param {String} markup - HTML markup
 * @returns {Object} - Heading object
 */
function getHeadings(markup) {
  const regex = /<h([1-5]) id="([^"]+)">([^<]+)</g;
  const matches = [...markup.matchAll(regex)];

  return matches.map((obj, index, arr) => {
    const level = +obj[1];
    const id = obj[2];
    const text = obj[3];

    const parent = getParent(obj, index, arr);

    return { level, id, text, parent };
  });
}

export default function tableOfContent(markup) {
  const root = { id: 'root', text: '', parent: '', level: 0 };
  const headings = getHeadings(markup);

  return stratify().parentId((d) => d.parent)([root, ...headings]);
}
