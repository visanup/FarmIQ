import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4108/api/farms' });

export interface Farm {
  farm_id?: number;
  customer_id: number;
  name: string;
  location?: string;
  status?: string;
}

export const farmService = {
  create: (data: Farm) => API.post('/', data),
  // you can add update, list, etc.
};