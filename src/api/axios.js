import axios from "axios";
const BASE_URL = 'https://library-project-backend.vercel.app/';

export default axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});