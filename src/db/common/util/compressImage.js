import convert from 'image-file-resize';

export default async function compressImage(file, width) {
  const aspect = await getAspectRatio(file);

  return convert({
    file,
    width,
    height: width * aspect,
  });
}

async function getAspectRatio(file) {
  return new Promise((resolve) => {
    const objURL = URL.createObjectURL(file);
    const img = new Image();

    img.onload = function () {
      const { height, width } = this;
      resolve(height / width);
    };

    img.src = objURL;
  }).catch((error) => {
    throw new Error(error);
  });
}
