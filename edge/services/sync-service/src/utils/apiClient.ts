import axios from "axios";
import { CLOUD_API_URL, CLOUD_API_KEY } from "../configs/config";

const apiClient = axios.create({
  baseURL: CLOUD_API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": CLOUD_API_KEY,
  },
});

export default apiClient;

