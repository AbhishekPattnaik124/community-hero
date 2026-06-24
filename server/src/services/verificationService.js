const ssim = require('ssim.js');
// Mocking image processing. In a real app, you'd use something like sharp or canvas
// to load the image buffer into raw pixel data required by ssim.js

/**
 * Service to handle SSIM image comparison for resolution proof.
 */
class VerificationService {
  
  /**
   * Mocks loading an image into a format ssim.js expects
   * @param {String} imageUrl 
   */
  async mockLoadImageData(imageUrl) {
    // In reality, download image -> decode -> return { data, width, height }
    // For this mock, returning dummy data
    return {
      data: new Uint8ClampedArray(100 * 100 * 4),
      width: 100,
      height: 100
    };
  }

  /**
   * Compares the before and after photos.
   * If images are too similar (SSIM > 0.95), it might be the same photo re-uploaded.
   * If images are too different (SSIM < 0.20), it might be a completely unrelated photo.
   * We expect a score in between, showing the same scene but with differences (the fix).
   * 
   * @param {String} beforeImageUrl 
   * @param {String} afterImageUrl 
   * @returns {Object} 
   */
  async verifyResolutionPhotos(beforeImageUrl, afterImageUrl) {
    try {
      const img1 = await this.mockLoadImageData(beforeImageUrl);
      const img2 = await this.mockLoadImageData(afterImageUrl);

      // We use ssim function to compare
      // For mock purposes, we wrap in try-catch in case our dummy data fails ssim.js validation
      let ssimScore = 0.5; 
      try {
        const result = ssim.ssim(img1, img2);
        ssimScore = result.mssim;
      } catch (e) {
        // Fallback mock score if ssim fails on dummy uint8 arrays
        ssimScore = 0.65;
      }

      let status = 'pending';
      let message = 'Comparison successful.';

      if (ssimScore > 0.95) {
        status = 'rejected';
        message = 'Images are nearly identical. Please upload a real after-resolution photo.';
      } else if (ssimScore < 0.20) {
        status = 'flagged';
        message = 'Images are completely different. Please ensure the photo is from the same angle/location.';
      } else {
        status = 'approved';
        message = 'Resolution photo verified by AI.';
      }

      return {
        verified: status === 'approved',
        score: ssimScore,
        status,
        message
      };

    } catch (error) {
      console.error('Error verifying photos:', error);
      return { verified: false, status: 'error', message: error.message };
    }
  }
}

module.exports = new VerificationService();
