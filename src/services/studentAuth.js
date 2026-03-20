const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
const isDevelopment = import.meta.env.DEV;
const rawBaseUrl = configuredBaseUrl || (isDevelopment ? 'http://localhost:8000' : 'https://legolas228.pythonanywhere.com');
const withoutTrailingSlash = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
const apiBaseUrl = withoutTrailingSlash.endsWith('/api') ? withoutTrailingSlash.slice(0, -4) : withoutTrailingSlash;

const resolveApiBaseUrl = () => {
  if (!apiBaseUrl) {
    throw new Error('Student API is not configured. Please set VITE_API_BASE_URL.');
  }
  return apiBaseUrl;
};

const parseResponseData = async (response) => response.json().catch(() => null);

const getAuthHeader = (token) => {
  if (!token) throw new Error('Auth token is required.');
  return { Authorization: `Token ${token}` };
};

export const studentLogin = async ({ identifier, password }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(data?.detail || 'No se pudo iniciar sesion.');
  }

  return data;
};

export const studentRegister = async ({ username, email, password, password_confirm, language_level }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, password_confirm, language_level }),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    // Handle specific field errors
    if (data && typeof data === 'object') {
      const errors = [];
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
          errors.push(`${key}: ${value[0]}`);
        } else if (typeof value === 'string') {
          errors.push(value);
        }
      }
      if (errors.length > 0) {
        throw new Error(errors[0]);
      }
    }
    throw new Error(data?.detail || 'No se pudo crear la cuenta.');
  }

  return data;
};

export const studentLogout = async (token) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/auth/logout/`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(token),
    },
  });

  if (!response.ok && response.status !== 401) {
    const data = await parseResponseData(response);
    throw new Error(data?.detail || 'No se pudo cerrar sesion.');
  }
};

export const getCurrentStudent = async (token) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/auth/me/`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(token),
    },
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(data?.detail || 'Sesion no valida.');
  }

  return data;
};

export const getStudentBookings = async (token) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/bookings/`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(token),
    },
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(data?.detail || 'No se pudieron cargar las sesiones.');
  }

  if (Array.isArray(data)) return data;
  return data?.results || [];
};

export const createStudentBooking = async ({ token, lesson_id, date, time, notes = '' }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/bookings/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(token),
    },
    body: JSON.stringify({ lesson_id, date, time, notes }),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    const conflictError = data?.non_field_errors?.[0];
    throw new Error(conflictError || data?.detail || 'No se pudo crear la reserva.');
  }

  return data;
};

export const getLessons = async (token) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/lessons/`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(token),
    },
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(data?.detail || 'No se pudieron cargar las clases.');
  }

  if (Array.isArray(data)) return data;
  return data?.results || [];
};

export const cancelStudentBooking = async ({ token, bookingId }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/bookings/${bookingId}/cancel/`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(token),
    },
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(data?.error || data?.detail || 'No se pudo cancelar la sesion.');
  }

  return data;
};

export const getStudentMaterials = async (token) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/materials/`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(token),
    },
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(data?.detail || 'No se pudieron cargar los materiales.');
  }

  if (Array.isArray(data)) return data;
  return data?.results || [];
};

export const createStudentMaterial = async ({ token, payload }) => {
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
    headers: {
      ...(hasFile ? {} : { 'Content-Type': 'application/json' }),
      ...getAuthHeader(token),
    },
    body,
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    if (data && typeof data === 'object') {
      for (const value of Object.values(data)) {
        if (Array.isArray(value) && value.length) {
          throw new Error(String(value[0]));
        }
        if (typeof value === 'string' && value.trim()) {
          throw new Error(value);
        }
      }
    }
    throw new Error(data?.detail || data?.non_field_errors?.[0] || 'No se pudo crear el material.');
  }

  return data;
};

export const getStudentGoals = async (token) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/goals/`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(token),
    },
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(data?.detail || 'No se pudieron cargar las metas.');
  }

  if (Array.isArray(data)) return data;
  return data?.results || [];
};

export const updateStudentGoal = async ({ token, goalId, payload }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/goals/${goalId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(token),
    },
    body: JSON.stringify(payload),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(data?.detail || 'No se pudo actualizar la meta.');
  }

  return data;
};

export const getStudentMessages = async (token) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/messages/`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(token),
    },
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(data?.detail || 'No se pudieron cargar los mensajes.');
  }

  if (Array.isArray(data)) return data;
  return data?.results || [];
};

export const markStudentMessageRead = async ({ token, messageId, is_read = true }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/messages/${messageId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(token),
    },
    body: JSON.stringify({ is_read }),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(data?.detail || 'No se pudo actualizar el mensaje.');
  }

  return data;
};

export const getStudentProgress = async (token) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/progress/`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(token),
    },
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(data?.detail || 'No se pudo cargar el progreso.');
  }

  if (Array.isArray(data)) return data;
  return data?.results || [];
};

export const getUserProfile = async (token) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/users/profile/`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(token),
    },
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(data?.detail || 'No se pudo cargar el perfil.');
  }

  return data || null;
};

export const updateUserProfile = async ({ token, language_level, bio }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/users/profile/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(token),
    },
    body: JSON.stringify({ language_level, bio }),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(data?.detail || 'No se pudo actualizar el perfil.');
  }

  return data;
};
