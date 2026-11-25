import type { Booking } from "@/types";

/**
 * Centralized API Client for TJ Rentcar
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

export class ApiClientError extends Error {
  code: string;
  details?: any[];

  constructor(code: string, message: string, details?: any[]) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // for HttpOnly cookie authentication
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    const error = json?.error || {
      code: "UNKNOWN_ERROR",
      message: "Terjadi kesalahan saat memproses data.",
    };
    throw new ApiClientError(error.code, error.message, error.details);
  }

  return json.data as T;
}

export const api = {
  // Public
  getSettings: () => request<any>("/public/settings"),
  getVehicles: (query: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
    });
    return request<any>(`/public/vehicles?${params.toString()}`);
  },
  getVehicleBySlug: (slug: string) => request<any>(`/public/vehicles/${slug}`),
  checkAvailability: (vehicleId: string, params: { pickupAt: string; returnAt: string; serviceType?: string; billingUnit?: string }) => {
    const search = new URLSearchParams(params as any).toString();
    return request<any>(`/public/vehicles/${vehicleId}/availability?${search}`);
  },
  getServices: () => request<any>("/public/services"),
  getServiceBySlug: (slug: string) => request<any>(`/public/services/${slug}`),
  getPage: (slug: string) => request<any>(`/public/pages/${slug}`),
  getFaqs: () => request<any>("/public/faqs"),
  getArticles: (page = 1, limit = 10) => request<any>(`/public/articles?page=${page}&limit=${limit}`),
  getArticleBySlug: (slug: string) => request<any>(`/public/articles/${slug}`),
  createBooking: (data: any) =>
    request<any>("/public/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  submitContact: (data: any) =>
    request<any>("/public/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Admin Auth
  adminLogin: (data: { email: string; password: string }) =>
    request<any>("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  adminLogout: () =>
    request<any>("/admin/auth/logout", {
      method: "POST",
    }),
  getAdminMe: () => request<any>("/admin/auth/me"),

  // Admin Dashboard & Management
  getDashboardStats: () => request<any>("/admin/dashboard"),

  // Admin Vehicles
  getAdminVehicles: () => request<any[]>("/admin/vehicles"),
  getAdminVehicleById: (id: string) => request<any>(`/admin/vehicles/${id}`),
  createAdminVehicle: (data: any) =>
    request<any>("/admin/vehicles", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateAdminVehicle: (id: string, data: any) =>
    request<any>(`/admin/vehicles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteAdminVehicle: (id: string) =>
    request<any>(`/admin/vehicles/${id}`, {
      method: "DELETE",
    }),
  uploadVehicleImage: (vehicleId: string, formData: FormData) =>
    request<any>(`/admin/vehicles/${vehicleId}/images`, {
      method: "POST",
      body: formData,
    }),
  deleteVehicleImage: (vehicleId: string, imageId: string) =>
    request<any>(`/admin/vehicles/${vehicleId}/images/${imageId}`, {
      method: "DELETE",
    }),
  setPrimaryVehicleImage: (vehicleId: string, imageId: string) =>
    request<any>(`/admin/vehicles/${vehicleId}/images/${imageId}/primary`, {
      method: "PATCH",
    }),

  // Admin Rates
  getVehicleRates: (vehicleId: string) => request<any[]>(`/admin/vehicles/${vehicleId}/rates`),
  createVehicleRate: (vehicleId: string, data: any) =>
    request<any>(`/admin/vehicles/${vehicleId}/rates`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateVehicleRate: (vehicleId: string, rateId: string, data: any) =>
    request<any>(`/admin/vehicles/${vehicleId}/rates/${rateId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteVehicleRate: (vehicleId: string, rateId: string) =>
    request<any>(`/admin/vehicles/${vehicleId}/rates/${rateId}`, {
      method: "DELETE",
    }),

  // Admin Bookings
  getAdminBookings: (query: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
    });
    return request<Booking[]>(`/admin/bookings?${params.toString()}`);
  },
  getAdminBookingById: (id: string) => request<any>(`/admin/bookings/${id}`),
  updateBookingStatus: (id: string, data: { status: string; paymentStatus?: string; amountPaid?: number }) =>
    request<any>(`/admin/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  updateBookingNotes: (id: string, data: { adminNote: string }) =>
    request<any>(`/admin/bookings/${id}/notes`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Admin Calendar & Blocks
  getCalendarData: (params: { startAt?: string; endAt?: string; vehicleId?: string } = {}) => {
    const search = new URLSearchParams(params as any).toString();
    return request<any>(`/admin/calendar?${search}`);
  },
  getVehicleBlocks: (vehicleId?: string) => {
    const q = vehicleId ? `?vehicleId=${vehicleId}` : "";
    return request<any[]>(`/admin/vehicle-blocks${q}`);
  },
  createVehicleBlock: (data: any) =>
    request<any>("/admin/vehicle-blocks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteVehicleBlock: (id: string) =>
    request<any>(`/admin/vehicle-blocks/${id}`, {
      method: "DELETE",
    }),

  // Admin Services
  getAdminServices: () => request<any[]>("/admin/services"),
  createAdminService: (data: any) =>
    request<any>("/admin/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateAdminService: (id: string, data: any) =>
    request<any>(`/admin/services/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteAdminService: (id: string) =>
    request<any>(`/admin/services/${id}`, {
      method: "DELETE",
    }),

  // Admin Content & Pages
  getAdminPages: () => request<any[]>("/admin/pages"),
  updateAdminPage: (id: string, data: any) =>
    request<any>(`/admin/pages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  getAdminFaqs: () => request<any[]>("/admin/faqs"),
  createAdminFaq: (data: any) =>
    request<any>("/admin/faqs", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteAdminFaq: (id: string) =>
    request<any>(`/admin/faqs/${id}`, {
      method: "DELETE",
    }),

  // Admin Articles
  getAdminArticles: () => request<any[]>("/admin/articles"),
  getAdminArticleById: (id: string) => request<any>(`/admin/articles/${id}`),
  createAdminArticle: (data: any) =>
    request<any>("/admin/articles", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateAdminArticle: (id: string, data: any) =>
    request<any>(`/admin/articles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteAdminArticle: (id: string) =>
    request<any>(`/admin/articles/${id}`, {
      method: "DELETE",
    }),

  // Admin Settings
  getAdminSettings: () => request<any>("/admin/settings"),
  updateAdminSettings: (data: any) =>
    request<any>("/admin/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Admin Contacts
  getAdminContacts: () => request<any[]>("/admin/contacts"),
  updateContactStatus: (id: string, status: string) =>
    request<any>(`/admin/contacts/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
