// ============================================================
// Central API Service — ShreeAnna FPO Website
// All calls go through here so the base URL is one place.
// ============================================================

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? "https://shreeanna.delightfulfield-3bc26253.centralindia.azurecontainerapps.io"
    : "http://localhost:5066");

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

  register: async (email, password, fullName = "") => {
    const data = await request("/api/auth/register", {
      method: "POST",
      body: { email, password, fullName },
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
  assignInspector: (id, data) =>
    request(`/api/lots/${id}/assign-inspector`, { method: "POST", body: data }),
  updateInspectorLocation: (id, data) =>
    request(`/api/lots/${id}/inspector-location`, { method: "POST", body: data }),
  getInspectors: () => request("/api/inspectors"),
};

// ─────────────────────────────────────────────────────────────
// AGREEMENTS
// ─────────────────────────────────────────────────────────────
export const agreementsApi = {
  getAll: () => request("/api/lots"),
  getById: (id) => request(`/api/lots/${id}`),
  getByLot: (id) => request(`/api/lots/${id}`),
  create: (id, data) => request(`/api/lots/${id}/agreement/create`, { method: "POST", body: data }),
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
  verifyCertificate: (certNum) => request(`/api/quality/certificates/verify/${certNum}`),
};


// ─────────────────────────────────────────────────────────────
// WAREHOUSES
// ─────────────────────────────────────────────────────────────
export const warehousesApi = {
  getAll: () => request("/api/warehouses"),
  getById: (id) => request(`/api/warehouses/${id}`),
  create: (data) => request("/api/warehouses", { method: "POST", body: data }),
  delete: (id) => request(`/api/warehouses/${id}`, { method: "DELETE" }),
  createReceipt: (data) => request("/api/warehouses/receipts", { method: "POST", body: data }),
  allocateLot: (data) => request("/api/warehouses/allocate-lot", { method: "POST", body: data }),
  getAllocatedLots: (id) => request(`/api/warehouses/${id}/allocated-lots`).catch(() => []),
};


// ─────────────────────────────────────────────────────────────
// INVENTORY
// ─────────────────────────────────────────────────────────────
export const inventoryApi = {
  getBatches: () => request("/api/inventory").catch(() => []),
  getMovements: () => request("/api/inventory/movements").catch(() => []),
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
  confirmDelivery: (id, data) =>
    request(`/api/dispatches/${id}/confirm-delivery`, { method: "POST", body: data }),
  reportIssue: (data, id) => {
    const url = id ? `/api/dispatches/${id}/report-issue` : "/api/dispatches/report-issue";
    return request(url, { method: "POST", body: data });
  },
  getDrivers: () => request("/api/dispatches/drivers"),
  createDriver: (data) => request("/api/dispatches/drivers", { method: "POST", body: data }),
  assignDriver: (id, data) => request(`/api/dispatches/${id}/assign-driver`, { method: "POST", body: data }),
  verifyPickup: (id, code) => request(`/api/dispatches/${id}/verify-pickup`, { method: "POST", body: { verificationCode: code } }),
};

// ─────────────────────────────────────────────────────────────
// MARKETPLACE
// ─────────────────────────────────────────────────────────────
export const marketplaceApi = {
  getAll: (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return request(`/api/marketplace${query}`);
  },
  getById: (id) => request(`/api/marketplace/${id}`),
  create: (data) => request("/api/marketplace", { method: "POST", body: data }),
  update: (id, data) => request(`/api/marketplace/${id}`, { method: "PUT", body: data }),
  updateStatus: (id, status) =>
    request(`/api/marketplace/${id}/status`, { method: "PATCH", body: { status } }),
  unpublish: (id) =>
    request(`/api/marketplace/${id}/unpublish`, { method: "POST" }),
  delete: (id) =>
    request(`/api/marketplace/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────
export const ordersApi = {
  getAll: (customerEmail) =>
    request(`/api/orders${customerEmail ? `?customerEmail=${encodeURIComponent(customerEmail)}` : ""}`).catch(() => []),
  getById: (id) => request(`/api/orders/${id}`).catch(() => null),
  create: (data) => request("/api/orders", { method: "POST", body: data }),
  updateStatus: (id, status) =>
    request(`/api/orders/${id}/status`, { method: "PATCH", body: { status } }),
  confirmDelivery: (id, otp) =>
    request(`/api/orders/${id}/confirm-delivery`, { method: "POST", body: { otp } }),
  assignDriver: (id, driverId) =>
    request(`/api/orders/${id}/assign-driver`, { method: "POST", body: { driverId } }),
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
  getAll: (status) =>
    request(
      status && status !== "All"
        ? `/api/settlements?status=${encodeURIComponent(status)}`
        : "/api/settlements"
    ),
  getStats: () => request("/api/settlements/stats"),
  getById: (id) => request(`/api/settlements/${id}`),
  create: (data) => request("/api/settlements", { method: "POST", body: data }),
  createPaymentLink: (id) =>
    request(`/api/settlements/${id}/create-payment-link`, { method: "POST" }),
  processPayment: (id, data) =>
    request(`/api/settlements/${id}/pay`, { method: "POST", body: data }),
  updateStatus: (id, status) =>
    request(`/api/settlements/${id}/status`, { method: "PATCH", body: { status } }),
};

// ─────────────────────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────────────────────
export const reportsApi = {
  getSummary: () => request("/api/reports/summary"),
  getFinanceReport: (year) =>
    request(`/api/reports/finance${year ? `?year=${year}` : ""}`),
  getRevenueReport: () => request("/api/reports/revenue"),
  getMarginReport: () => request("/api/reports/margin"),
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

   getRecentActivities: () =>
    request("/api/dashboard/recent-activities"),
};

// ─────────────────────────────────────────────────────────────
// UPLOADS (Azure Blob Storage SAS & Direct Uploads)
// ─────────────────────────────────────────────────────────────
export const uploadApi = {
  uploadImage: async (file) => {
    const ext = file.name ? file.name.split('.').pop() : 'jpg';
    const token = getInMemoryToken();

    // 1. Attempt SAS URL upload (Direct to Azure Blob Storage)
    try {
      const sasData = await request(`/api/upload/sas?ext=${encodeURIComponent(ext || 'jpg')}`);
      if (sasData?.sasUrl && sasData?.permanentUrl) {
        const putRes = await fetch(sasData.sasUrl, {
          method: "PUT",
          headers: {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": file.type || "image/jpeg",
          },
          body: file,
        });

        if (putRes.ok) {
          return sasData.permanentUrl;
        }
      }
    } catch (err) {
      console.warn("Direct Azure SAS upload failed, attempting fallback endpoint...", err);
    }

    // 2. Fallback to server-side POST /api/upload
    const formData = new FormData();
    formData.append("file", file);
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(errData.message || "Failed to upload image.");
    }

    const data = await res.json();
    return data.imageUrl || data.url;
  },
};

// ─────────────────────────────────────────────────────────────
// PROCESSOR PURCHASE REQUESTS & AGREEMENTS
// ─────────────────────────────────────────────────────────────
export const purchaseRequestsApi = {
  getAll: (status, processorId) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (processorId) params.append("processorId", processorId);
    const qs = params.toString();
    return request(`/api/purchase-requests${qs ? `?${qs}` : ""}`);
  },
  getById: (id) => request(`/api/purchase-requests/${id}`),
  create: (data) => request("/api/purchase-requests", { method: "POST", body: data }),
  proposeAgreement: (id, data) => request(`/api/purchase-requests/${id}/propose-agreement`, { method: "POST", body: data }),
  acceptAgreement: (id) => request(`/api/purchase-requests/${id}/accept-agreement`, { method: "POST" }),
  pay: (id, data) => request(`/api/purchase-requests/${id}/pay`, { method: "POST", body: data }),
  confirmDelivery: (id, data) => request(`/api/purchase-requests/${id}/confirm-delivery`, { method: "POST", body: data }),
};



