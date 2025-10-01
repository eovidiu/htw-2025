// Input sanitization utilities

/**
 * Sanitizes text input by trimming whitespace and limiting length
 * @param {string} text - The text to sanitize
 * @param {number} maxLength - Maximum allowed length (default: 10000)
 * @returns {string} Sanitized text
 */
export const sanitizeText = (text, maxLength = 10000) => {
  if (typeof text !== 'string') {
    return '';
  }

  // Trim whitespace and limit length
  const trimmed = text.trim().substring(0, maxLength);

  // Remove null bytes and other control characters except newlines and tabs
  return trimmed.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
};

/**
 * Sanitizes and validates tags
 * @param {string|Array} tags - Tags as comma-separated string or array
 * @param {number} maxTags - Maximum number of tags allowed (default: 10)
 * @param {number} maxTagLength - Maximum length per tag (default: 50)
 * @returns {Array} Array of sanitized tags
 */
export const sanitizeTags = (tags, maxTags = 10, maxTagLength = 50) => {
  let tagArray = [];

  if (typeof tags === 'string') {
    tagArray = tags.split(',');
  } else if (Array.isArray(tags)) {
    tagArray = tags;
  } else {
    return [];
  }

  return tagArray
    .map(tag => {
      if (typeof tag !== 'string') return '';
      // Remove control characters, trim, and limit length
      return tag
        .replace(/[\x00-\x1F\x7F]/g, '')
        .trim()
        .substring(0, maxTagLength);
    })
    .filter(tag => tag.length > 0)
    .slice(0, maxTags);
};

/**
 * Validates and sanitizes capture data
 * @param {Object} capture - The capture object to sanitize
 * @returns {Object} Sanitized capture object
 */
export const sanitizeCapture = (capture) => {
  const sanitized = { ...capture };

  // Sanitize text if present
  if (sanitized.text) {
    sanitized.text = sanitizeText(sanitized.text);
  }

  // Sanitize tags if present
  if (sanitized.tags) {
    sanitized.tags = sanitizeTags(sanitized.tags);
  }

  return sanitized;
};
