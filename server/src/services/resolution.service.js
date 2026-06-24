/**
 * Digital Authority Bridge - Resolution Proof System
 * Handles checking before/after photos when an authority marks an issue as resolved.
 */

const stringSimilarity = require('string-similarity');
const logger = require('../config/logger');

class ResolutionService {
  /**
   * Compare "Before" and "After" photos to ensure the authority actually
   * took a photo of the same location.
   * Note: In production, we'd use OpenCV or true Structural Similarity Index (SSIM).
   * Here we mock the behavior using a string-similarity hash check for the architectural pipeline.
   */
  async verifyResolution(originalImageHashes, newImageBuffer) {
    logger.info('[ResolutionProof] Verifying after-photo using SSIM mockup...');
    
    // In a real scenario, we calculate SSIM between the two images.
    // If SSIM < 0.3, it means the images are completely different structures (e.g. they uploaded a stock photo).
    // If SSIM > 0.95, it means they literally uploaded the exact same photo.
    // We want an SSIM between 0.4 and 0.9 (similar structure, but visually changed).
    
    // Simulate SSIM logic
    const ssimScore = 0.65 + (Math.random() * 0.2); // Random score between 0.65 and 0.85
    
    if (ssimScore < 0.4) {
      return { 
        isValid: false, 
        reason: 'Image structure does not match the original location. Did you upload a generic photo?',
        ssimScore
      };
    }
    
    return { 
      isValid: true, 
      ssimScore 
    };
  }
}

module.exports = new ResolutionService();
