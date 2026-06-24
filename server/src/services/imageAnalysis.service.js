/**
 * Free Image Authenticity Service
 * Uses local open-source libraries for EXIF extraction and perceptual hashing.
 */

const logger = require('../config/logger');
const ExifParser = require('exif-parser');
const imghash = require('imghash');

class ImageAnalysisService {
  /**
   * Extract EXIF data
   */
  async extractExif(imageBuffer) {
    try {
      logger.info('[ImageAnalysis] Extracting EXIF data...');
      const parser = ExifParser.create(imageBuffer);
      const result = parser.parse();
      
      const createTime = result.tags.DateTimeOriginal || result.tags.CreateDate;
      if (!createTime) {
        return { DateTimeOriginal: null, isOld: false };
      }
      
      const dateTaken = new Date(createTime * 1000);
      const now = new Date();
      
      // If photo was taken more than 48 hours ago
      const isOld = (now - dateTaken) > (48 * 60 * 60 * 1000);
      
      return { DateTimeOriginal: dateTaken, isOld };
    } catch (err) {
      logger.warn(`EXIF parsing failed: ${err.message}`);
      return { DateTimeOriginal: null, isOld: false };
    }
  }

  /**
   * Generate Perceptual Hash
   */
  async generatePHash(imageBuffer) {
    try {
      logger.info('[ImageAnalysis] Generating pHash...');
      const hash = await imghash.hash(imageBuffer);
      return hash;
    } catch (err) {
      logger.warn(`pHash generation failed: ${err.message}`);
      return null;
    }
  }

  /**
   * Run Google Vision Reverse Search (Skipped in Free mode)
   */
  async reverseImageSearch(imageUrl) {
    return { isWebImage: false, matchCount: 0 };
  }

  /**
   * Detect AI Generated or Edited Images (Skipped in Free mode)
   */
  async detectFake(imageBuffer) {
    return { fakeProbability: 0 };
  }
}

module.exports = new ImageAnalysisService();
