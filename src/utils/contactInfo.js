// Archivo para manejar la información de contacto centralizada
const rawEmail = import.meta.env.VITE_CONTACT_EMAIL || 'habluj.sk@gmail.com';
const rawInstagram = import.meta.env.VITE_CONTACT_INSTAGRAM || 'habluj_sk';

const normalizeEmail = (value) => String(value || '')
  .trim()
  .replace(/^mailto:/i, '');

const normalizeInstagram = (value) => String(value || '')
  .trim()
  .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
  .replace(/^@/, '')
  .replace(/\/+$/, '');

export const contactInfo = {
  email: normalizeEmail(rawEmail),
  instagram: normalizeInstagram(rawInstagram),
};

// Función auxiliar para crear enlaces
export const getContactLinks = {
  email: () => `mailto:${contactInfo.email}`,
  instagram: () => `https://instagram.com/${contactInfo.instagram}`,
};
