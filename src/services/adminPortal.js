const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
const isDevelopment = import.meta.env.DEV;
const rawBaseUrl = configuredBaseUrl || (isDevelopment ? 'http://localhost:8000' : 'https://legolas228.pythonanywhere.com');
const withoutTrailingSlash = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
const apiBaseUrl = withoutTrailingSlash.endsWith('/api') ? withoutTrailingSlash.slice(0, -4) : withoutTrailingSlash;

const resolveApiBaseUrl = () => {
  if (!apiBaseUrl) {
    throw new Error('Admin API is not configured. Please set VITE_API_BASE_URL.');
  }
  return apiBaseUrl;
};

const parseResponseData = async (response) => response.json().catch(() => null);

const getErrorMessage = (response, data, fallbackMessage) => {
  const detail = data?.detail || data?.error || '';
  if (data && typeof data === 'object') {
    for (const value of Object.values(data)) {
      if (Array.isArray(value) && value.length) return String(value[0]);
      if (typeof value === 'string' && value.trim()) return value;
    }
  }
  if (response.status === 401 || response.status === 403) {
    return 'Solicitud admin no autorizada. Revisa usuario y contrasena.';
  }
  return detail || fallbackMessage;
};

const getAuthHeaders = (authHeader, includeJson = false) => {
  if (!authHeader) {
    throw new Error('Admin credentials are required.');
  }

  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    Authorization: authHeader,
  };
};

const buildQueryString = (params = {}) => {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '' && value !== 'all');
  if (!entries.length) return '';
  const searchParams = new URLSearchParams(entries);
  return `?${searchParams.toString()}`;
};

export const getAdminStudents = async (authHeader, filters = {}) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/admin/students/${buildQueryString(filters)}`, {
    method: 'GET',
    headers: getAuthHeaders(authHeader),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'No se pudieron cargar estudiantes.'));
  }

  if (Array.isArray(data)) return data;
  return data?.results || [];
};

export const getAdminBookings = async (authHeader, filters = {}) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/bookings/${buildQueryString(filters)}`, {
    method: 'GET',
    headers: getAuthHeaders(authHeader),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'No se pudieron cargar las reservas.'));
  }

  if (Array.isArray(data)) return data;
  return data?.results || [];
};

export const getAdminLessons = async (authHeader) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/lessons/`, {
    method: 'GET',
    headers: getAuthHeaders(authHeader),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'No se pudieron cargar las clases.'));
  }

  if (Array.isArray(data)) return data;
  return data?.results || [];
};

export const updateAdminBooking = async ({ authHeader, bookingId, patch }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/bookings/${bookingId}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(authHeader, true),
    body: JSON.stringify(patch),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'No se pudo actualizar la reserva.'));
  }

  return data;
};

export const updateAdminStudent = async ({ authHeader, studentId, patch }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/admin/students/${studentId}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(authHeader, true),
    body: JSON.stringify(patch),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'No se pudo actualizar el estudiante.'));
  }

  return data;
};

export const getAdminMaterials = async (authHeader, filters = {}) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/materials/${buildQueryString(filters)}`, {
    method: 'GET',
    headers: getAuthHeaders(authHeader),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'No se pudieron cargar los materiales.'));
  }

  if (Array.isArray(data)) return data;
  return data?.results || [];
};

export const createAdminMaterial = async ({ authHeader, payload }) => {
  const baseUrl = resolveApiBaseUrl();
  const hasFile = payload?.uploaded_file instanceof File;
  const body = hasFile ? new FormData() : JSON.stringify(payload);

  if (hasFile) {
    Object.entries(payload || {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return;
      body.append(key, value);
    });
  }

  const response = await fetch(`${baseUrl}/api/materials/`, {
    method: 'POST',
    headers: hasFile ? getAuthHeaders(authHeader, false) : getAuthHeaders(authHeader, true),
    body,
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'No se pudo crear el material.'));
  }

  return data;
};

export const updateAdminMaterial = async ({ authHeader, materialId, payload }) => {
  const baseUrl = resolveApiBaseUrl();
  const hasFile = payload?.uploaded_file instanceof File;
  const body = hasFile ? new FormData() : JSON.stringify(payload);

  if (hasFile) {
    Object.entries(payload || {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return;
      body.append(key, value);
    });
  }

  const response = await fetch(`${baseUrl}/api/materials/${materialId}/`, {
    method: 'PATCH',
    headers: hasFile ? getAuthHeaders(authHeader, false) : getAuthHeaders(authHeader, true),
    body,
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'No se pudo actualizar el material.'));
  }

  return data;
};

export const deleteAdminMaterial = async ({ authHeader, materialId }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/materials/${materialId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(authHeader),
  });

  if (!response.ok) {
    const data = await parseResponseData(response);
    throw new Error(getErrorMessage(response, data, 'No se pudo eliminar el material.'));
  }
};

export const getAdminGoals = async (authHeader, filters = {}) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/goals/${buildQueryString(filters)}`, {
    method: 'GET',
    headers: getAuthHeaders(authHeader),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'No se pudieron cargar las metas.'));
  }

  if (Array.isArray(data)) return data;
  return data?.results || [];
};

export const createAdminGoal = async ({ authHeader, payload }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/goals/`, {
    method: 'POST',
    headers: getAuthHeaders(authHeader, true),
    body: JSON.stringify(payload),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'No se pudo crear la meta.'));
  }

  return data;
};

export const updateAdminGoal = async ({ authHeader, goalId, payload }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/goals/${goalId}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(authHeader, true),
    body: JSON.stringify(payload),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'No se pudo actualizar la meta.'));
  }

  return data;
};

export const deleteAdminGoal = async ({ authHeader, goalId }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/goals/${goalId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(authHeader),
  });

  if (!response.ok) {
    const data = await parseResponseData(response);
    throw new Error(getErrorMessage(response, data, 'No se pudo eliminar la meta.'));
  }
};

export const getAdminMessages = async (authHeader, filters = {}) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/messages/${buildQueryString(filters)}`, {
    method: 'GET',
    headers: getAuthHeaders(authHeader),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'No se pudieron cargar los mensajes.'));
  }

  if (Array.isArray(data)) return data;
  return data?.results || [];
};

export const createAdminMessage = async ({ authHeader, payload }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/messages/`, {
    method: 'POST',
    headers: getAuthHeaders(authHeader, true),
    body: JSON.stringify(payload),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'No se pudo enviar el mensaje.'));
  }

  return data;
};

export const updateAdminMessage = async ({ authHeader, messageId, payload }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/messages/${messageId}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(authHeader, true),
    body: JSON.stringify(payload),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'No se pudo actualizar el mensaje.'));
  }

  return data;
};

export const deleteAdminMessage = async ({ authHeader, messageId }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/messages/${messageId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(authHeader),
  });

  if (!response.ok) {
    const data = await parseResponseData(response);
    throw new Error(getErrorMessage(response, data, 'No se pudo eliminar el mensaje.'));
  }
};

export const getAdminProgress = async (authHeader, filters = {}) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/progress/${buildQueryString(filters)}`, {
    method: 'GET',
    headers: getAuthHeaders(authHeader),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'No se pudo cargar el progreso.'));
  }

  if (Array.isArray(data)) return data;
  return data?.results || [];
};

export const createAdminProgress = async ({ authHeader, payload }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/progress/`, {
    method: 'POST',
    headers: getAuthHeaders(authHeader, true),
    body: JSON.stringify(payload),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'No se pudo crear el progreso.'));
  }

  return data;
};

export const updateAdminProgress = async ({ authHeader, progressId, payload }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/progress/${progressId}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(authHeader, true),
    body: JSON.stringify(payload),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'No se pudo actualizar el progreso.'));
  }

  return data;
};

export const deleteAdminProgress = async ({ authHeader, progressId }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/progress/${progressId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(authHeader),
  });

  if (!response.ok) {
    const data = await parseResponseData(response);
    throw new Error(getErrorMessage(response, data, 'No se pudo eliminar el progreso.'));
  }
};
