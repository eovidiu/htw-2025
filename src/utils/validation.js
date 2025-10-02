// File size limit in bytes (15 MB)
export const MAX_FILE_SIZE = 15 * 1024 * 1024;

/**
 * Validate file size against maximum limit
 * @param {File} file - The file to validate
 * @returns {Object} - { valid: boolean, error: string|null, sizeMB: number }
 */
export const validateFileSize = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided', sizeMB: 0 };
  }

  const fileSizeMB = file.size / (1024 * 1024);

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size (${fileSizeMB.toFixed(1)} MB) exceeds the 15 MB limit. Please choose a smaller image or compress it first.`,
      sizeMB: fileSizeMB
    };
  }

  return { valid: true, error: null, sizeMB: fileSizeMB };
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i];
};
