/* eslint-disable no-param-reassign */
import axios from 'axios';
import { auth } from '@/config/firebaseConfig';

export default function setup() {
  axios.interceptors.request.use(
    async (request) => {
      if (request.url.includes('create') && request.url.includes('access')) {
        return request;
      }

      const token = await auth.currentUser.getIdToken();

      request.headers.Authorization = `Bearer ${token}`;
      return request;
    },
    (err) => {
      return Promise.reject(err);
    }
  );
}
