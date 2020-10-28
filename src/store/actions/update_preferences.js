export default async function updatePreference({ state }) {
  try {
    await state.user.ref.update({ preferences: state.user.preferences });
  } catch (error) {
    throw new Error(error);
  }
}
