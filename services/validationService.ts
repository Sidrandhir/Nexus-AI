/**
 * Input Validation Service
 * Sanitizes and validates user input to prevent XSS, injection attacks, and invalid data
 */

const MAX_MESSAGE_LENGTH = 50000;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/markdown',
  'application/json',
  'text/csv',
  'application/zip'
];

export const validateInput = {
  /**
   * Sanitize message text - prevent XSS and injection
   */
  message: (text: string): { valid: boolean; error?: string; value?: string } => {
    if (!text || typeof text !== 'string') {
      return { valid: false, error: 'Message must be a non-empty string' };
    }

    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return { valid: false, error: 'Message cannot be empty' };
    }

    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, error: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters` };
    }

    // Basic XSS prevention - remove dangerous patterns
    const sanitized = trimmed
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/on\w+\s*=\s*['"][^'"]*['"]/gi, '')
      .trim();

    return { valid: true, value: sanitized };
  },

  /**
   * Validate image file
   */
  imageFile: (file: File): { valid: boolean; error?: string } => {
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid image type. Allowed: JPG, PNG, GIF, WebP' };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
    }

    if (file.size === 0) {
      return { valid: false, error: 'File is empty' };
    }

    return { valid: true };
  },

  /**
   * Validate document file
   */
  documentFile: (file: File): { valid: boolean; error?: string } => {
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid document type. Allowed: PDF, DOCX, XLSX, TXT, MD, JSON, CSV, ZIP' };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
    }

    if (file.size === 0) {
      return { valid: false, error: 'File is empty' };
    }

    return { valid: true };
  },

  /**
   * Validate email
   */
  email: (email: string): { valid: boolean; error?: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email address' };
    }
    return { valid: true };
  },

  /**
   * Validate URL for safety
   */
  url: (url: string): { valid: boolean; error?: string } => {
    try {
      const urlObj = new URL(url);
      // Only allow http and https
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
      }
      return { valid: true };
    } catch (e) {
      return { valid: false, error: 'Invalid URL' };
    }
  },

  /**
   * Validate API key format
   */
  apiKey: (key: string): { valid: boolean; error?: string } => {
    if (!key || typeof key !== 'string') {
      return { valid: false, error: 'API key is required' };
    }

    if (key.length < 10) {
      return { valid: false, error: 'API key is too short' };
    }

    if (key.includes(' ')) {
      return { valid: false, error: 'API key cannot contain spaces' };
    }

    return { valid: true };
  },

  /**
   * Validate conversation title
   */
  conversationTitle: (title: string): { valid: boolean; error?: string; value?: string } => {
    if (!title || typeof title !== 'string') {
      return { valid: false, error: 'Title must be a non-empty string' };
    }

    const trimmed = title.trim();
    if (trimmed.length === 0) {
      return { valid: false, error: 'Title cannot be empty' };
    }

    if (trimmed.length > 200) {
      return { valid: false, error: 'Title cannot exceed 200 characters' };
    }

    const sanitized = trimmed
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/on\w+\s*=\s*['"][^'"]*['"]/gi, '')
      .trim();

    return { valid: true, value: sanitized };
  }
};

/**
 * Escape HTML special characters to prevent XSS
 */
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * Check if value is safely a string before using
 */
export const isSafeString = (value: any): value is string => {
  return typeof value === 'string' && value.length > 0 && value.length <= 50000;
};

/**
 * Check if value is safely a number
 */
export const isSafeNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * Deep clone object safely (prevents circular references)
 */
export const safeClone = <T>(obj: T): T | null => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.error('Failed to clone object:', e);
    return null;
  }
};
