import axios from "axios";

// 配置请求的基准路径，根据环境变量决定
const baseURL = import.meta.env.VITE_APP_BASE_URL;
// 创建一个 axios 实例
const request = axios.create({
  baseURL,
  timeout: 5000,
});

// 添加请求拦截器
request.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
request.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    return response;
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

export default request;
//导出地址

const url = "http://localhost:3000";
export { url, baseURL };
