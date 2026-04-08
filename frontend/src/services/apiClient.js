/**
 * API client for ServiceSetu (see CONTRACT.md).
 * Base URL: VITE_API_BASE_URL or http://localhost:8000/api → requests go to `${base}/v1/...`.
 */

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
).replace(/\/$/, "");

const API_PREFIX = "/v1";

/**
 * @param {Response} res
 * @returns {Promise<any>}
 */
async function parseJsonBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

/**
 * @param {string} path - path under /v1 (e.g. "/auth/login")
 * @param {RequestInit} [init]
 * @returns {Promise<any>}
 */
async function request(path, init = {}) {
  const url = `${BASE_URL}${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(init.headers || {});
  if (
    init.body !== undefined &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    credentials: "include",
    ...init,
    headers,
  });

  const body = await parseJsonBody(res);

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("servicesetu:unauthorized"));
    }
    const msg =
      (body && typeof body.message === "string" && body.message) ||
      "Unauthorized";
    throw new Error(msg);
  }

  if (!res.ok) {
    const msg =
      (body && typeof body.message === "string" && body.message) ||
      res.statusText ||
      "Request failed";
    throw new Error(msg);
  }

  return body;
}

export const authApi = {
  /**
   * @param {string} identifier - email or phone
   * @param {string} password
   */
  async login(identifier, password) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: identifier, phone: identifier, password }),
    });
  },

  /**
   * @param {string} fullname
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @param {string} phone
   * @param {string} address
   * @param {{ traceId?: string }} [options]
   */
  async register(fullname, username, email, password, phone, address, options = {}) {
    const headers = {};
    if (options.traceId) headers["X-Trace-Id"] = options.traceId;
    return request("/auth/register", {
      method: "POST",
      headers,
      body: JSON.stringify({
        fullname,
        username,
        email,
        password,
        phone,
        address,
      }),
    });
  },

  async logout() {
    return request("/auth/logout", { method: "POST" });
  },

  async getMe() {
    return request("/users/profile", { method: "GET" });
  },
};

export const providerApi = {
  /**
   * @param {FormData | { serviceType: string, address: string, pricing?: number, isAvailable?: boolean }} data
   * @param {string} [token] - optional access token
   * @param {{ traceId?: string }} [options]
   */
  async becomeProvider(data, token, options = {}) {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (options.traceId) headers["X-Trace-Id"] = options.traceId;
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    return request("/providers/become", {
      method: "POST",
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  /**
   * @param {number} [page=1]
   * @param {{ serviceType?: string, limit?: number }} [filters]
   */
  async getProviders(page = 1, filters = {}) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(filters.limit ?? 10));
    if (filters.serviceType) {
      params.set("serviceType", filters.serviceType);
    }
    return request(`/getProviders/provider?${params.toString()}`, {
      method: "GET",
    });
  },

  /**
   * @param {{ lat?: number, lon?: number, address?: string, radius?: number, serviceType?: string, page?: number, limit?: number }} filters
   */
  async getNearbyProviders(filters = {}) {
    const params = new URLSearchParams();
    if (filters.lat !== undefined) params.set("lat", String(filters.lat));
    if (filters.lon !== undefined) params.set("lon", String(filters.lon));
    if (filters.address) params.set("address", filters.address);
    params.set("radius", String(filters.radius ?? 5000));
    params.set("page", String(filters.page ?? 1));
    params.set("limit", String(filters.limit ?? 10));
    if (filters.serviceType) params.set("serviceType", filters.serviceType);

    return request(`/providers/nearby?${params.toString()}`, {
      method: "GET",
    });
  },

  /**
   * CONTRACT has no GET-by-id route; resolves the provider by walking paginated
   * GET /getProviders/provider until a matching `id` is found.
   * @param {string} id
   */
  async getProviderById(id) {
    const target = String(id);
    let page = 1;
    const limit = 50;

    while (true) {
      const res = await providerApi.getProviders(page, { limit });
      const list = res?.data?.data;
      const pagination = res?.data?.pagination;

      if (Array.isArray(list)) {
        const found = list.find((p) => String(p.id) === target);
        if (found) {
          return {
            ...res,
            data: found,
          };
        }
      }

      const totalPages =
        pagination && typeof pagination.totalPages === "number"
          ? pagination.totalPages
          : 0;

      if (page >= totalPages || totalPages === 0) {
        throw new Error("Provider not found");
      }

      page += 1;
    }
  },

  async getProviderBookings() {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", "10");
    return request(`/bookings/provider?${params.toString()}`, {
      method: "GET",
    });
  },

  async getProviderEarnings() {
    return request("/bookings/provider/earnings", {
      method: "GET",
    });
  },
};

export const bookingApi = {
  /**
   * @param {{ providerId: string, bookingDate: string, note?: string }} bookingData
   */
  async createBooking(bookingData) {
    return request("/bookings/create", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  },

  async getMyBookings() {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", "10");
    return request(`/bookings/user-bookings?${params.toString()}`, {
      method: "GET",
    });
  },

  async cancelBooking(bookingId) {
    return request(`/bookings/${encodeURIComponent(bookingId)}/cancel`, {
      method: "PATCH",
    });
  },

  async confirmCompletion(bookingId) {
    return request(`/bookings/${encodeURIComponent(bookingId)}/confirm-completion`, {
      method: "PATCH",
    });
  },

  /**
   * Provider marks service completed (CONTRACT: POST).
   * @param {string} bookingId
   */
  async completeBooking(bookingId) {
    return request(`/bookings/${encodeURIComponent(bookingId)}/complete`, {
      method: "POST",
    });
  },

  async acceptBooking(bookingId) {
    return request(`/bookings/${encodeURIComponent(bookingId)}/accept`, {
      method: "POST",
    });
  },

  async rejectBooking(bookingId) {
    return request(`/bookings/${encodeURIComponent(bookingId)}/reject`, {
      method: "POST",
    });
  },
};

export const paymentApi = {
  async getGatewayStatus() {
    return request("/payments/status", {
      method: "GET",
    });
  },

  /**
  * CONTRACT: POST /payments/create-order body is { providerId, bookingDate, note?, address? }.
  * @param {{ providerId: string, bookingDate: string, note?: string, address?: string }} orderPayload
   */
  async createOrder(orderPayload) {
    return request("/payments/create-order", {
      method: "POST",
      body: JSON.stringify(orderPayload),
    });
  },

  /**
   * @param {{ razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string }} paymentData
   */
  async verifyPayment(paymentData) {
    return request("/payments/verify", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  },
};

export const userApi = {
  async getDashboard() {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", "10");
    return request(`/bookings/user-bookings?${params.toString()}`, {
      method: "GET",
    });
  },
};

export const reviewApi = {
  async addReview(providerId, bookingId, rating, comment = "") {
    return request("/reviews", {
      method: "POST",
      body: JSON.stringify({ providerId, bookingId, rating, comment }),
    });
  },

  async getProviderReviews(providerId, page = 1, limit = 10) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    return request(`/reviews/${encodeURIComponent(providerId)}?${params.toString()}`, {
      method: "GET",
    });
  },
};

// Backward-compatible named exports for pages/hooks that import function-style APIs.
export const becomeProvider = (data, token) => providerApi.becomeProvider(data, token);

export const getProviders = (filters = {}) => providerApi.getProviders(1, filters);

export const getProviderById = (id) => providerApi.getProviderById(id);

export const getProviderBookings = () =>
  request("/bookings/provider", {
    method: "GET",
  });

export const acceptBooking = (id) =>
  request(`/bookings/${encodeURIComponent(id)}/accept`, {
    method: "POST",
  });

export const rejectBooking = (id) =>
  request(`/bookings/${encodeURIComponent(id)}/reject`, {
    method: "POST",
  });

export const completeBooking = (id) =>
  request(`/bookings/${encodeURIComponent(id)}/complete`, {
    method: "PATCH",
  });
