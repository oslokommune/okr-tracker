export default function (content, filename, filetype) {
  const url = URL.createObjectURL(new Blob([content]));
  const downloadLink = document.createElement('a');
  if (window.navigator.msSaveOrOpenBlob) {
    downloadLink.href = '#';
    downloadLink.download = '';
    downloadLink.addEventListener('click', () => window.navigator.msSaveOrOpenBlob(content, `${filename}${filetype}`));
    downloadLink.click();
  } else {
    downloadLink.href = url;
    downloadLink.download = `${filename}${filetype}`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}
