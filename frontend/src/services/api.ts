const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE = `${API_ORIGIN}/api`;

function getAuthHeaders(isFormData: boolean = false): Record<string, string> {
  const token = localStorage.getItem('cropguard_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMessage = 'An error occurred';
    try {
      const err = await res.json();
      errMessage = err.detail || err.message || JSON.stringify(err);
    } catch {
      errMessage = res.statusText || `HTTP ${res.status}`;
    }
    throw new Error(errMessage);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(phone: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });
    return handleResponse<{ access_token: string; role: string; name: string; user_id: number }>(res);
  },

  async register(data: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ access_token: string; role: string; name: string; user_id: number }>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Farmer
  async getFarmerDashboard() {
    const res = await fetch(`${API_BASE}/farmer/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  async updateFarmerProfile(data: any) {
    const res = await fetch(`${API_BASE}/farmer/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  // Disease Detection
  async analyzeCrop(formData: FormData) {
    const res = await fetch(`${API_BASE}/detection/analyze`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    return handleResponse<any>(res);
  },

  async getHistory(crop?: string, status?: string, search?: string) {
    const params = new URLSearchParams();
    if (crop) params.append('crop', crop);
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/detection/history?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  async getReportDetail(id: number | string) {
    const res = await fetch(`${API_BASE}/detection/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  async addFollowUp(reportId: number | string, observationText: string, recoveryStatus: string) {
    const res = await fetch(`${API_BASE}/detection/${reportId}/follow-up`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ observation_text: observationText, recovery_status: recoveryStatus }),
    });
    return handleResponse<any>(res);
  },

  async getModelMetrics() {
    const res = await fetch(`${API_BASE}/detection/metrics`);
    return handleResponse<any>(res);
  },

  // Pest Detection
  async detectPests(formData: FormData) {
    const res = await fetch(`${API_BASE}/pests/detect`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    return handleResponse<any>(res);
  },

  // Risk Surveillance
  async predictRisk(data: any) {
    const res = await fetch(`${API_BASE}/risk/predict`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async getLocationRisk(district: string, crop: string, stage: string = 'Vegetative') {
    const res = await fetch(`${API_BASE}/risk/location?district=${encodeURIComponent(district)}&crop=${encodeURIComponent(crop)}&stage=${encodeURIComponent(stage)}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Weather
  async getWeather(district: string) {
    const res = await fetch(`${API_BASE}/weather/current?district=${encodeURIComponent(district)}`);
    return handleResponse<any>(res);
  },

  async getDistricts() {
    const res = await fetch(`${API_BASE}/weather/districts`);
    return handleResponse<string[]>(res);
  },

  // Expert
  async getPendingReports(crop?: string) {
    const url = crop ? `${API_BASE}/expert/pending-reports?crop=${encodeURIComponent(crop)}` : `${API_BASE}/expert/pending-reports`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  async verifyReport(reportId: number | string, data: any) {
    const res = await fetch(`${API_BASE}/expert/verify/${reportId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  // Admin
  async getAdminDashboard() {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Advisories
  async getAdvisories(crop?: string, search?: string) {
    const params = new URLSearchParams();
    if (crop) params.append('crop', crop);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/advisories?${params.toString()}`);
    return handleResponse<any[]>(res);
  },

  // Crop Catalogue
  async getCropCategories() {
    const res = await fetch(`${API_BASE}/crops/categories`);
    return handleResponse<any[]>(res);
  },

  async getCrops(filters?: { category?: string; state?: string; season?: string; search?: string; ai_supported?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.state) params.append('state', filters.state);
    if (filters?.season) params.append('season', filters.season);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.ai_supported !== undefined) params.append('ai_supported', String(filters.ai_supported));
    const res = await fetch(`${API_BASE}/crops?${params.toString()}`);
    return handleResponse<any[]>(res);
  },

  async getCropDetail(idOrSlug: string | number) {
    const res = await fetch(`${API_BASE}/crops/${idOrSlug}`);
    return handleResponse<any>(res);
  },

  async getSupportedModelClasses() {
    const res = await fetch(`${API_BASE}/crops/ai/supported-classes`);
    return handleResponse<any>(res);
  },

  // India-wide Location
  async getStates() {
    const res = await fetch(`${API_BASE}/location/states`);
    return handleResponse<string[]>(res);
  },

  async getDistrictsForState(state: string) {
    const res = await fetch(`${API_BASE}/location/districts?state=${encodeURIComponent(state)}`);
    return handleResponse<string[]>(res);
  },

  async getStateCrops(state: string) {
    const res = await fetch(`${API_BASE}/location/crops?state=${encodeURIComponent(state)}`);
    return handleResponse<any[]>(res);
  },

  // Analytics Dashboard (Replaces Surveillance Map)
  async getAnalyticsSummary() {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    return handleResponse<any>(res);
  },

  async getAnalyticsStateReports() {
    const res = await fetch(`${API_BASE}/analytics/state-reports`);
    return handleResponse<any[]>(res);
  },

  async getAnalyticsDistrictReports(state?: string) {
    const url = state ? `${API_BASE}/analytics/district-reports?state=${encodeURIComponent(state)}` : `${API_BASE}/analytics/district-reports`;
    const res = await fetch(url);
    return handleResponse<any[]>(res);
  },

  async getAnalyticsCropDiseaseStats() {
    const res = await fetch(`${API_BASE}/analytics/crop-disease-stats`);
    return handleResponse<any[]>(res);
  },

  async getAnalyticsMonthlyTrends() {
    const res = await fetch(`${API_BASE}/analytics/monthly-trends`);
    return handleResponse<any[]>(res);
  },

  async getAnalyticsVerificationStats() {
    const res = await fetch(`${API_BASE}/analytics/verification-stats`);
    return handleResponse<any[]>(res);
  },

  // Govt Schemes, Mandi Rates & Voice Sahayak Q&A
  async getSchemesAndMandi() {
    const res = await fetch(`${API_BASE}/advisories/schemes-mandi`);
    return handleResponse<any>(res);
  },

  async askKisanSahayak(query: string, language: string = 'hi') {
    const res = await fetch(`${API_BASE}/advisories/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, language }),
    });
    return handleResponse<any>(res);
  },
};

