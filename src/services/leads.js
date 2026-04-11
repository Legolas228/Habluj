const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
const isDevelopment = import.meta.env.DEV;
const rawBaseUrl = configuredBaseUrl || (isDevelopment ? 'http://localhost:8000' : 'https://legolas228.pythonanywhere.com');
const withoutTrailingSlash = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
const apiBaseUrl = withoutTrailingSlash.endsWith('/api') ? withoutTrailingSlash.slice(0, -4) : withoutTrailingSlash;

const resolveApiBaseUrl = () => {
  if (!apiBaseUrl) {
    throw new Error('Lead API is not configured. Please set VITE_API_BASE_URL.');
  }
  return apiBaseUrl;
};

const parseResponseData = async (response) => {
  return response.json().catch(() => null);
};

const getErrorMessage = (response, data, fallbackMessage) => {
  const detail = data?.detail || data?.error || '';
  if (response.status === 401 || response.status === 403) {
    const detailText = String(detail).toLowerCase();
    if (detailText.includes('invalid username') || detailText.includes('invalid password')) {
      return 'Credenciales invalidas. Revisa tus datos de acceso.';
    }
    return 'Solicitud admin no autorizada. Revisa tus datos de acceso.';
  }
  if (detail) return detail;
  return fallbackMessage;
};

const getAdminHeaders = (authHeader) => {
  if (!authHeader) {
    throw new Error('Admin credentials are required.');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: authHeader,
  };
};

export const createBasicAuthHeader = (username, password) => {
  const user = (username || '').trim();
  if (!user || !password) {
    throw new Error('Access data and password are required.');
  }

  // Support non-ASCII credentials by encoding to UTF-8 before base64.
  const credentials = `${user}:${password}`;
  const utf8Bytes = new TextEncoder().encode(credentials);
  let binary = '';
  utf8Bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return `Basic ${btoa(binary)}`;
};

export const loginAdminWithPassword = async ({ identifier, password }) => {
  const baseUrl = resolveApiBaseUrl();
  const cleanIdentifier = (identifier || '').trim();

    if (!cleanIdentifier || !password) {
      throw new Error('Access data and password are required.');
  }

  const response = await fetch(`${baseUrl}/api/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identifier: cleanIdentifier, password }),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(data?.detail || 'Credenciales invalidas.');
  }

  if (!data?.user?.is_staff) {
    throw new Error('La cuenta existe, pero no tiene permisos de admin.');
  }

  if (!data?.token) {
    throw new Error('No se pudo obtener el token de acceso admin.');
  }

  return `Token ${data.token}`;
};

export const submitLeadCapture = async (leadPayload) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/leads/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leadPayload),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'Lead capture failed'));
  }
  return data;
};

export const getLeadMetrics = async (authHeader, filters = {}) => {
  const baseUrl = resolveApiBaseUrl();
  const queryString = buildQueryString(filters);
  const response = await fetch(`${baseUrl}/api/leads/metrics/${queryString}`, {
    method: 'GET',
    headers: getAdminHeaders(authHeader),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'Unable to fetch lead metrics'));
  }

  return data;
};

export const verifyAdminCredentials = async (authHeader) => {
  // Reuse metrics endpoint as an auth probe for dashboard login.
  await getLeadMetrics(authHeader, {});
};

const buildQueryString = (params = {}) => {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '' && value !== 'all');
  if (!entries.length) return '';
  const searchParams = new URLSearchParams(entries);
  return `?${searchParams.toString()}`;
};

export const getLeads = async (authHeader, filters = {}) => {
  const baseUrl = resolveApiBaseUrl();
  const queryString = buildQueryString(filters);
  const response = await fetch(`${baseUrl}/api/leads/${queryString}`, {
    method: 'GET',
    headers: getAdminHeaders(authHeader),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'Unable to fetch leads'));
  }

  if (Array.isArray(data)) return data;
  return data?.results || [];
};

export const getLeadDetail = async ({ leadId, authHeader }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/leads/${leadId}/`, {
    method: 'GET',
    headers: getAdminHeaders(authHeader),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'Unable to fetch lead detail'));
  }

  return data;
};

export const updateLead = async ({ leadId, patch, authHeader }) => {
  const baseUrl = resolveApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/leads/${leadId}/`, {
    method: 'PATCH',
    headers: getAdminHeaders(authHeader),
    body: JSON.stringify(patch),
  });

  const data = await parseResponseData(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(response, data, 'Unable to update lead'));
  }

  return data;
};

export const updateLeadStage = async ({ leadId, stage, authHeader }) => {
  return updateLead({ leadId, patch: { stage }, authHeader });
};

export const exportLeadsCsv = async (authHeader, filters = {}) => {
  const baseUrl = resolveApiBaseUrl();
  const queryString = buildQueryString(filters);
  const response = await fetch(`${baseUrl}/api/leads/export_csv/${queryString}`, {
    method: 'GET',
    headers: {
      Authorization: authHeader,
    },
  });

  if (!response.ok) {
    const data = await parseResponseData(response);
    throw new Error(getErrorMessage(response, data, 'Unable to export leads CSV'));
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get('content-disposition') || '';
  const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  const filename = filenameMatch?.[1] || 'leads_export.csv';

  return { blob, filename };
};
