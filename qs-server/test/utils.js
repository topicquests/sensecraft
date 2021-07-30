const axios = require('axios');
const { hash } = require('bcryptjs');

class AxiosUtil {
  constructor(baseURL) {
    this.axios = axios.create({ baseURL });
  }
  headers(token, headers) {
    return token ? { headers: { Authorization: `Bearer ${token}`, ...headers } } : {};
  }

  as_params(id) {
    return Object.fromEntries(
      Object.entries(id).map(([key, value]) => [key, `eq.${value}`]));
  }
  
  async get(path, id, token) {
    const params = this.as_params(id);
    try {
      const response = await this.axios.get(path, { params, ... this.headers(token) });
      return response.data;
    } catch (error) {
      console.error(error.response.status, error.response.data.message);
      throw error;
    }
  }

  async delete(path, id, token) {
    const params = this.as_params(id);
    try {
      const headers = this.headers(token, { Prefer: 'return=representation'});
      const response = await this.axios.delete(path, { params, ...headers });
      return response.data;
    } catch (error) {
      console.error(error.response.status, error.response.data.message);
      throw error;
    }
  }

  async create(path, data, token) {
    try {
      if (path === 'members') {
        data = { ...data, password: await hash(data.password, 10) };
      }
      const response = await this.axios.post(path, data, this.headers(token));
      var location = response.headers.location.split('?')[1].split('&');
      location = Object.fromEntries(location.map((p) => {
        const [k, v] = p.split('=');
        return [k, v.substring(3)];
      }));
      return location;
    } catch (error) {
      console.error(error.response.status, error.response.data.message);
      throw error;
    }
  }

  async update(path, id, data, token) {
    try {
      const params = this.as_params(id);
      const headers = this.headers(token, { Prefer: 'return=representation'});
      const response = await this.axios({
        method: 'patch',
        url: path,
        data, params,
        ...headers
      });
      return response.data;
    } catch (error) {
      console.error(error.response.status, error.response.data.message);
      throw error;
    }
  }

  async call(fn, params, token) {
    try {
      const response = await this.axios.get(`/rpc/${fn}`, { params, ... this.headers(token) });
      return response.data;
    } catch (error) {
      console.error(error.response.status, error.response.data.message);
      throw error;
    }
  }
}

module.exports = {
  axiosUtil: new AxiosUtil('http://localhost:3001')
};
