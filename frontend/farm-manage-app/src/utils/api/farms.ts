// src/utils/api/farms.ts
export type Farm = {
  farm_id?: number;
  name: string;
  location?: string;
  status?: string;
};

// ใช้ environment variable จาก .env (Vite แนะนำใช้ VITE_ prefix)
const API_BASE = `${import.meta.env.VITE_FARM_SERVICE_URL}/api/farms`;

// Helper ฟังก์ชันเพิ่ม headers สำหรับ Authorization ถ้ามี token
function getHeaders() {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function getFarms(): Promise<Farm[]> {
  const res = await fetch(API_BASE, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch farms');
  return res.json();
}

export async function getFarmsByCustomerId(customer_id: number | string): Promise<Farm[]> {
  const res = await fetch(`${API_BASE}/customer/${customer_id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch farms for customer id=${customer_id}`);
  return res.json();
}

export async function getFarm(id: number | string): Promise<Farm> {
  const res = await fetch(`${API_BASE}/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch farm id=${id}`);
  return res.json();
}

export async function createFarm(data: Farm): Promise<Farm> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to create farm');
  }
  return res.json();
}

export async function updateFarm(id: number | string, data: Farm): Promise<Farm> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || `Failed to update farm id=${id}`);
  }
  return res.json();
}

export async function deleteFarm(id: number | string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || `Failed to delete farm id=${id}`);
  }
}

