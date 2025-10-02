/**
 * CaptureQueue manages concurrent capture operations
 * to prevent overwhelming browser storage and maintain performance
 */
class CaptureQueue {
  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent;
    this.activeCaptures = 0;
    this.listeners = new Set();
  }

  /**
   * Add a listener for queue state changes
   * @param {Function} callback - Called with current state
   */
  addListener(callback) {
    this.listeners.add(callback);
    // Immediately call with current state
    callback({
      active: this.activeCaptures,
      max: this.maxConcurrent,
      canAddMore: this.canAddMore()
    });
  }

  /**
   * Remove a listener
   * @param {Function} callback - Listener to remove
   */
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of state change
   */
  notifyListeners() {
    const state = {
      active: this.activeCaptures,
      max: this.maxConcurrent,
      canAddMore: this.canAddMore()
    };
    this.listeners.forEach(callback => callback(state));
  }

  /**
   * Execute a capture operation with queue management
   * @param {Function} captureFunction - Async function to execute
   * @returns {Promise} - Result of capture function
   * @throws {Error} - If queue limit reached
   */
  async addCapture(captureFunction) {
    // Check if limit reached
    if (this.activeCaptures >= this.maxConcurrent) {
      throw new Error(
        `Too many items being processed at once. Please wait for current uploads to complete (${this.activeCaptures}/${this.maxConcurrent}).`
      );
    }

    this.activeCaptures++;
    this.notifyListeners();

    try {
      const result = await captureFunction();
      return result;
    } finally {
      this.activeCaptures--;
      this.notifyListeners();
    }
  }

  /**
   * Check if more captures can be added
   * @returns {boolean}
   */
  canAddMore() {
    return this.activeCaptures < this.maxConcurrent;
  }

  /**
   * Get current active capture count
   * @returns {number}
   */
  getActiveCount() {
    return this.activeCaptures;
  }

  /**
   * Get maximum concurrent captures
   * @returns {number}
   */
  getMaxConcurrent() {
    return this.maxConcurrent;
  }

  /**
   * Get current queue state
   * @returns {Object}
   */
  getState() {
    return {
      active: this.activeCaptures,
      max: this.maxConcurrent,
      canAddMore: this.canAddMore()
    };
  }
}

// Create and export singleton instance
export const captureQueue = new CaptureQueue(5);
