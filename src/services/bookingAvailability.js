const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
const isDevelopment = import.meta.env.DEV;
const rawBaseUrl = configuredBaseUrl || (isDevelopment ? 'http://localhost:8000' : 'https://legolas228.pythonanywhere.com');
const apiBaseUrl = rawBaseUrl.replace(/\/$/, '').replace(/\/api$/, '');

const parseResponse = async (response) => response.json().catch(() => null);

export const getBookingSettings = async () => {
  const response = await fetch(`${apiBaseUrl}/api/booking-settings/`);
  const data = await parseResponse(response);
  if (!response.ok) throw new Error(data?.detail || 'No se pudo consultar el estado de las reservas.');
  return data;
};

export const getAdminBookingSettings = async (authHeader) => {
  const response = await fetch(`${apiBaseUrl}/api/admin/booking-settings/`, { headers: { Authorization: authHeader } });
  const data = await parseResponse(response);
  if (!response.ok) throw new Error(data?.detail || 'No se pudo consultar el estado de las reservas.');
  return data;
};

export const updateAdminBookingSettings = async ({ authHeader, individualBookingsOpen }) => {
  const response = await fetch(`${apiBaseUrl}/api/admin/booking-settings/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader },
    body: JSON.stringify({ individual_bookings_open: individualBookingsOpen }),
  });
  const data = await parseResponse(response);
  if (!response.ok) throw new Error(data?.detail || 'No se pudo actualizar el estado de las reservas.');
  return data;
};
