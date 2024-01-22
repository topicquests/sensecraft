import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
export const api = axios.create({ baseURL: server_url });

// TODO: right now expiry is shared knowledge with backend.
// Ideally, I should read it from the token.
export const TOKEN_EXPIRATION = 1000000;

class TokenStore {
  token: str | undefined;
  tokenExpiry: number | undefined;
  constructor() {
    this.token = window.localStorage.getItem('token');
    const origTokenExpiry = window.localStorage.getItem('tokenExpiry');
    this.tokenExpiry = origTokenExpiry
      ? Number.parseInt(origTokenExpiry)
      : undefined;
  }
  setToken(token: string, tokenExpiry: number) {
    this.token = token;
    this.tokenExpiry = tokenExpiry || Date.now() + TOKEN_EXPIRATION;
    window.localStorage.setItem('token', token);
    window.localStorage.setItem('tokenExpiry', tokenExpiry.toString());
  }
  tokenIsValid() {
    return this.token && this.tokenExpiry && Date.now() < this.tokenExpiry;
  }
  getToken() {
    if (this.tokenIsValid()) {
      return this.token;
    }
  }
  clearToken() {
    this.token = undefined;
    this.tokenExpiry = undefined;
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('tokenExpiry');
  }
}

export const token_store = new TokenStore();

api.interceptors.request.use(function (config) {
  const token = token_store.getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  if (
    config.method === "put" ||
    config.method === "patch" ||
    config.method === "delete" ||
    (config.method === "post" && config.url.substring(0, 4) != "/rpc")
  ) {
    config.headers['Prefer'] = 'return=representation';
  }
  return config;
});

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});
