// Archivo para manejar la información de contacto centralizada
export const contactInfo = {
  email: import.meta.env.VITE_CONTACT_EMAIL || 'habluj.sk@gmail.com',
  instagram: import.meta.env.VITE_CONTACT_INSTAGRAM || 'habluj_sk',
};

// Función auxiliar para crear enlaces
export const getContactLinks = {
  email: () => `mailto:${contactInfo.email}`,
  instagram: () => `https://instagram.com/${contactInfo.instagram}`,
};
