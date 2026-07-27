import axios from "axios";
// import { interceptorRequest, interceptorReponse } from "./interceptor";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

const departmentApi = axios.create({
  baseURL: `${backendUrl}/api/department`,
});

// departmentApi.interceptors.request.use(interceptorRequest);
// departmentApi.interceptors.response.reject(interceptorReponse);

export default departmentApi;
