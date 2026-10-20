import axios from 'axios'

import { AUTH_TOKEN_KEY } from '../constants/storage.js'

/**
 * Shared Axios instance for all client API calls.
 *
 * The base URL is `VITE_API_URL` (which already ends in `/api/v1/client`) and
 * falls back to `/api/v1/client`. Endpoints are always requested as
 * `<base>/overview`, `<base>/alerts`, ... — the client and sensor ids are NEVER
 * sent in a URL, query string or body: the backend derives them from the token.
 */
const http = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || '/api/v1/client',
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // localStorage may be unavailable (SSR / privacy mode); ignore.
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize failures to the SAME shape the dummy layer throws:
    // `{ status, message }` — so pages only ever read `error.message`.
    const status = error?.response?.status ?? 0
    const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    if (status === 401) {
      // TODO: clear the session and redirect to /login (done in api/auth.js).
    }
    return Promise.reject({ status, message })
  },
)

export default http
