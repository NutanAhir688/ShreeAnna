// ============================================================
// Central API Service — ShreeAnna FPO Website
// All calls go through here so the base URL is one place.
// ============================================================

export const API_BASE = "http://localhost:5066";

/**
 * In-Memory Token Storage
 * Access token lives purely in JavaScript memory (closure variable),
 * NOT in localStorage or sessionStorage, completely eliminating CSRF risks.
 */
let memoryAccessToken = null;

export function setInMemoryToken(token) {
  memoryAccessToken = token;
}

export function getInMemoryToken() {
  return memoryAccessToken;
}

/**
 * Generic request helper. Passes in-memory JWT as Bearer header.
 * Uses credentials: "include" to pass HttpOnly refresh token cookie.
 */
async function request(path, { method = "GET", body, token, isRetry = false } = {}) {
  const currentToken = token || memoryAccessToken;
  const headers = { "Content-Type": "application/json" };
  if (currentToken) {
    headers["Authorization"] = `Bearer ${currentToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: "include",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 401 && !isRetry && path !== "/api/auth/login" && path !== "/api/auth/refresh") {
    try {
      const refreshedData = await auth.refresh();
      if (refreshedData?.accessToken) {
        return request(path, { method, body, token: refreshedData.accessToken, isRetry: true });
      }
    } catch (e) {
      memoryAccessToken = null;
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────
export const auth = {
  login: async (email, password) => {
    const data = await request("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    if (data?.accessToken) {
      setInMemoryToken(data.accessToken);
    }
    return data;
  },

  refresh: async () => {
    try {
      const data = await request("/api/auth/refresh", {
        method: "POST",
      });
      if (data?.accessToken) {
        setInMemoryToken(data.accessToken);
      }
      return data;
    } catch (err) {
      setInMemoryToken(null);
      return null;
    }
  },

  logout: async () => {
    try {
      await request("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.warn("Logout request error", e);
    } finally {
      setInMemoryToken(null);
    }
  },

  me: () => request("/api/auth/me"),
};

// ─────────────────────────────────────────────────────────────
// FARMERS
// ─────────────────────────────────────────────────────────────
export const farmersApi = {
  getAll: () => request("/api/farmers"),
  getById: (id) => request(`/api/farmers/${id}`),
  create: (data) => request("/api/farmers", { method: "POST", body: data }),
  update: (id, data) => request(`/api/farmers/${id}`, { method: "PUT", body: data }),
  delete: (id) => request(`/api/farmers/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────
// FARMS
// ─────────────────────────────────────────────────────────────
export const farmsApi = {
  getAll: () => request("/api/farms"),
  getByFarmer: (farmerId) => request(`/api/farmers/${farmerId}/farms`),
  getById: (id) => request(`/api/farms/${id}`),
  create: (farmerId, data) =>
    request(`/api/farmers/${farmerId}/farms`, { method: "POST", body: data }),
  update: (id, data) => request(`/api/farms/${id}`, { method: "PUT", body: data }),
  updateStatus: (id, status) =>
    request(`/api/farms/${id}/status`, { method: "PATCH", body: { status } }),
};

// ─────────────────────────────────────────────────────────────
// PROCUREMENT LOTS
// ─────────────────────────────────────────────────────────────
export const lotsApi = {
  getAll: () => request("/api/lots"),
  getById: (id) => request(`/api/lots/${id}`),
  getByFarmer: (farmerId) => request(`/api/farmers/${farmerId}/lots`),
  create: (data) => request("/api/lots", { method: "POST", body: data }),
  updateStatus: (id, status, notes) =>
    request(`/api/lots/${id}/status`, { method: "PATCH", body: { status, notes } }),
};

// ─────────────────────────────────────────────────────────────
// AGREEMENTS
// ─────────────────────────────────────────────────────────────
export const agreementsApi = {
  getAll: () => request("/api/lots"),
  getById: (id) => request(`/api/lots/${id}`),
  accept: (id) => request(`/api/lots/${id}/agreement/accept`, { method: "POST" }),
  reject: (id, reason) =>
    request(`/api/lots/${id}/agreement/reject`, {
      method: "POST",
      body: { reason: reason || "Rejected by FPO Officer" },
    }),
};

// ─────────────────────────────────────────────────────────────
// QUALITY
// ─────────────────────────────────────────────────────────────
export const qualityApi = {
  getAll: () => request("/api/quality/inspections"),
  getByLot: (lotId) => request(`/api/quality/inspections/lot/${lotId}`),
  create: (data) =>
    request("/api/quality/inspections", { method: "POST", body: data }),
  getCertificate: (lotId) => request(`/api/quality/certificates/lot/${lotId}`),
  getAllCertificates: () => request("/api/quality/certificates"),
};

// ─────────────────────────────────────────────────────────────
// WAREHOUSES
// ─────────────────────────────────────────────────────────────
export const warehousesApi = {
  getAll: () => request("/api/warehouses"),
  getById: (id) => request(`/api/warehouses/${id}`),
  create: (data) => request("/api/warehouses", { method: "POST", body: data }),
};

// ─────────────────────────────────────────────────────────────
// INVENTORY
// ─────────────────────────────────────────────────────────────
export const inventoryApi = {
  getBatches: () => request("/api/inventory/batches"),
  getMovements: () => request("/api/inventory/movements"),
  createMovement: (data) =>
    request("/api/inventory/movements", { method: "POST", body: data }),
};

// ─────────────────────────────────────────────────────────────
// LOGISTICS / DISPATCHES
// ─────────────────────────────────────────────────────────────
export const logisticsApi = {
  getAll: () => request("/api/dispatches"),
  getById: (id) => request(`/api/dispatches/${id}`),
  create: (data) => request("/api/dispatches", { method: "POST", body: data }),
  updateStatus: (id, status) =>
    request(`/api/dispatches/${id}/status`, { method: "PATCH", body: { status } }),
};

// ─────────────────────────────────────────────────────────────
// MARKETPLACE
// ─────────────────────────────────────────────────────────────
export const marketplaceApi = {
  getAll: () => request("/api/marketplace"),
  getById: (id) => request(`/api/marketplace/${id}`),
  create: (data) => request("/api/marketplace", { method: "POST", body: data }),
  updateStatus: (id, status) =>
    request(`/api/marketplace/${id}/status`, { method: "PATCH", body: { status } }),
};

// ─────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────
export const ordersApi = {
  getAll: () => request("/api/orders"),
  getById: (id) => request(`/api/orders/${id}`),
  create: (data) => request("/api/orders", { method: "POST", body: data }),
  updateStatus: (id, status) =>
    request(`/api/orders/${id}/status`, { method: "PATCH", body: { status } }),
};

// ─────────────────────────────────────────────────────────────
// BUYERS
// ─────────────────────────────────────────────────────────────
export const buyersApi = {
  getAll: () => request("/api/buyers"),
  getById: (id) => request(`/api/buyers/${id}`),
  create: (data) => request("/api/buyers", { method: "POST", body: data }),
};

// ─────────────────────────────────────────────────────────────
// SETTLEMENTS / PAYMENTS
// ─────────────────────────────────────────────────────────────
export const settlementsApi = {
  getAll: () => request("/api/settlements"),
  getById: (id) => request(`/api/settlements/${id}`),
  create: (data) => request("/api/settlements", { method: "POST", body: data }),
  updateStatus: (id, status) =>
    request(`/api/settlements/${id}/status`, { method: "PATCH", body: { status } }),
};

// ─────────────────────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────────────────────
export const reportsApi = {
  getSummary: () => request("/api/reports/summary"),
  getProcurementReport: (from, to) =>
    request(`/api/reports/procurement?from=${from}&to=${to}`),
  getFinanceReport: (year) => request(`/api/reports/finance?year=${year}`),
};

// ─────────────────────────────────────────────────────────────
// FPO MEMBERS
// ─────────────────────────────────────────────────────────────
export const fpoApi = {
  getAll: () => request("/api/fpo/members"),
  getById: (id) => request(`/api/fpo/members/${id}`),
};

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => request("/api/dashboard/stats"),
};
