// Application configuration
// This file centralizes environment-specific settings

/**
 * API Base URL
 * - In production: Points to Railway backend
 * - In development: Uses proxy or localhost
 */
export const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Stripe Publishable Key
 */
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

/**
 * Environment detection
 */
export const isDevelopment = import.meta.env.MODE === 'development';
export const isProduction = import.meta.env.MODE === 'production';

/**
 * API request helper with proper base URL
 */
export function getApiUrl(path: string): string {
  // If path is already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Ensure API_URL has protocol (in case user forgot https://)
  let baseUrl = API_URL;
  if (baseUrl && !baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`;
  }
  
  // In development, use proxy (empty API_URL means relative paths)
  // In production, use full Railway URL
  return `${baseUrl}${path}`;
}

