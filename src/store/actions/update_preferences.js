// import { db } from '@/config/firebaseConfig';

export default async function ({ state }) {
  try {
    await state.user.ref.update({ preferences: state.user.preferences });
  } catch (error) {
    throw new Error(error);
  }
}
