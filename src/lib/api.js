import { getToken } from './auth';


const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Core fetch wrapper. Automatically attaches Authorization header when a
 * token is present and Content-Type for JSON bodies.
 */
async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// ── Users ──────────────────────────────────────────────────────────────────
export const api = {
  login:    (body)       => request('/users/login',    { method: 'POST', body }),
  register: (body)       => request('/users/register', { method: 'POST', body }),
  getUsers:              () => request('/users',        { auth: true }),
  getUser:  (id)         => request(`/users/${id}`,    { auth: true }),
  updateUser: (id, body) => request(`/users/${id}`,    { method: 'PATCH', body, auth: true }),
  deleteUser: (id)       => request(`/users/${id}`,    { method: 'DELETE', auth: true }),

  // Categories
  getCategories:           () => request('/categories'),
  getCategory:   (id)      => request(`/categories/${id}`),
  createCategory: (body)   => request('/categories',      { method: 'POST',   body, auth: true }),
  updateCategory: (id, b)  => request(`/categories/${id}`,{ method: 'PATCH',  body: b, auth: true }),
  deleteCategory: (id)     => request(`/categories/${id}`,{ method: 'DELETE', auth: true }),

  // Menu items
  getMenuItems: (catId) =>
    request(catId ? `/menu-items?category_id=${catId}` : '/menu-items'),
  getMenuItem:  (id)       => request(`/menu-items/${id}`),
  createMenuItem: (body)   => request('/menu-items',       { method: 'POST',   body, auth: true }),
  updateMenuItem: (id, b)  => request(`/menu-items/${id}`, { method: 'PATCH',  body: b, auth: true }),
  deleteMenuItem: (id)     => request(`/menu-items/${id}`, { method: 'DELETE', auth: true }),

  // Orders
  getOrders:              () => request('/orders',        { auth: true }),
  getOrder:  (id)         => request(`/orders/${id}`),
  createOrder: (body)     => request('/orders',           { method: 'POST', body }),
  updateOrder: (id, body) => request(`/orders/${id}`,    { method: 'PATCH', body, auth: true }),
  deleteOrder: (id)       => request(`/orders/${id}`,    { method: 'DELETE', auth: true }),

  // Order items
  getOrderItems:    (orderId)      => request(`/orders/${orderId}/items`),
  addOrderItem:     (orderId, b)   => request(`/orders/${orderId}/items`, { method: 'POST', body: b }),
  updateOrderItem:  (id, body)     => request(`/orders/items/${id}`,      { method: 'PATCH', body, auth: true }),
  deleteOrderItem:  (id)           => request(`/orders/items/${id}`,      { method: 'DELETE', auth: true }),
};
