import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

const zoneApi = axios.create({
    baseURL: `${backendUrl}/api/zone`,
});

export default zoneApi;
