// src/config.js
// All app-wide constants that come from environment variables.
// Set real values in your .env file (never commit .env to git).

/** Cloudinary */
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

/**
 * Admin email — any Firebase Auth user whose email matches this string
 * is treated as role:"admin" regardless of their Firestore users doc.
 * Set VITE_ADMIN_EMAIL in .env to enable admin access.
 */
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';
