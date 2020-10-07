import { storage } from '@/config/firebaseConfig';
import compressImage from './util/compressImage';

/**
 * Uploads a file to storage bucket
 * @param {string} id - User id
 * @param {File} image
 * @returns {String} - File URL
 */
export default async function uploadImage(id, image, folder) {
  if (!id) throw new Error('Id must be provided');
  if (!image) throw new Error('Image must be provided');
  if (image.type.split('/')[0] !== 'image') throw new Error('Invalid file');

  const imageWidth = 400;
  const storageRef = storage.ref(`${folder}/${id}-${image.name}`);

  try {
    const compressed = await compressImage(image, imageWidth);

    const { state, ref } = await storageRef.put(compressed);
    if (state !== 'success') throw new Error(state);

    return ref.getDownloadURL();
  } catch (error) {
    throw new Error(error);
  }
}
