import { auth } from '@/config/firebaseConfig';

const BASE_URL = import.meta.env.VITE_HOST_URL;

const api = async (path, opts) => {
  try {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      headers.append('Authorization', `Bearer ${token}`);
    }

    const res = await fetch([BASE_URL, path].join(''), {
      headers,
      ...opts,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message);
    }

    return json;
  } catch (error) {
    return Promise.reject(error);
  }
};

export default api;
