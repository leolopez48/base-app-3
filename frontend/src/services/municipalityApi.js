import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

const municipalityApi = axios.create({
    baseURL: `${backendUrl}/api/municipality`,
});

export default municipalityApi;
