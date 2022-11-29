/**
 * Return the ID part of a Google Sheets URL.
 */
export default function sheetIdFromUrl(url) {
  const rest = url.replace(/^(https?:\/\/)?docs\.google\.com\/spreadsheets\/d\//, '');
  const sliceAt = rest.indexOf('/');
  return sliceAt === -1 ? rest : rest.slice(0, sliceAt);
}
