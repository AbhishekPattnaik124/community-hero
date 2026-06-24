/**
 * NLP Service (IndicBERT Mock)
 * Detects civic issues from multi-lingual text (Bengali, Hindi, English).
 */
class NlpService {
  
  /**
   * Stubs a call to a Python microservice running IndicBERT.
   * Extracts category, sentiment, and confidence score.
   */
  async processText(text) {
    const textLower = text.toLowerCase();
    
    let category = 'other';
    let sentiment = 0; // -1 (angry) to 1 (happy)
    let isCivicIssue = false;

    // Simulate code-switching detection (Bengali/Hindi/English)
    const potholeKeywords = ['pothole', 'রাস্তায় গর্ত', 'rastay gorto', 'broken road', 'kharab rasta'];
    const waterKeywords = ['waterlogging', 'জলমগ্ন', 'paani', 'jal jamaw', 'flood'];
    const lightKeywords = ['streetlight', 'bijli nahi', 'darkness', 'andhera'];
    const garbageKeywords = ['garbage', 'aborgona', 'kachra', 'dump'];

    if (potholeKeywords.some(kw => textLower.includes(kw))) category = 'roads';
    else if (waterKeywords.some(kw => textLower.includes(kw))) category = 'water';
    else if (lightKeywords.some(kw => textLower.includes(kw))) category = 'electricity';
    else if (garbageKeywords.some(kw => textLower.includes(kw))) category = 'sanitation';

    if (category !== 'other') {
      isCivicIssue = true;
      // Simulate sentiment based on aggressive words
      const angryWords = ['terrible', 'worst', 'kharab', 'ignore', 'suffer'];
      if (angryWords.some(kw => textLower.includes(kw))) sentiment = -0.8;
      else sentiment = -0.4;
    }

    return {
      isCivicIssue,
      category,
      sentiment,
      confidence: Math.random() * (0.99 - 0.70) + 0.70, // Mock 70-99% confidence
    };
  }
}

module.exports = new NlpService();
