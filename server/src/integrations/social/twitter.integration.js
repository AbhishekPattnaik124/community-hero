/**
 * Twitter API v2 Filtered Stream Integration
 * Monitors for specific hashtags and keywords related to civic issues.
 */
class TwitterIntegration {
  constructor() {
    this.rules = [
      { value: 'KMC has:geo', tag: 'kmc_location' },
      { value: 'Kolkata pothole has:geo', tag: 'pothole' },
      { value: 'waterlogging kolkata has:geo', tag: 'waterlogging' },
      { value: 'bijli nahi kolkata has:geo', tag: 'electricity' },
      { value: 'paani nahi kolkata has:geo', tag: 'water' },
      { value: '#KolkataProblems has:geo', tag: 'general_complaint' }
    ];
  }

  /**
   * Simulates setting up the filtered stream.
   * In a real implementation, this would use the 'twitter-api-v2' package.
   */
  async startStream(kafkaProducer) {
    console.log('[Twitter Integration] Starting filtered stream...');
    // Real implementation: Set rules via POST /2/tweets/search/stream/rules
    // Then connect to GET /2/tweets/search/stream
    
    // Simulating incoming tweets periodically
    setInterval(async () => {
      const mockTweet = {
        platform: 'twitter',
        id: `tw-${Date.now()}`,
        text: "Massive pothole on EM Bypass near Science City causing terrible traffic! @kmc_kolkata #KolkataProblems",
        authorId: "user123",
        createdAt: new Date(),
        location: { type: 'Point', coordinates: [88.398, 22.544] }, // Science city mock
        sentiment: -0.8 // Negative
      };

      try {
        await kafkaProducer.send({
          topic: 'social-listening-raw',
          messages: [{ value: JSON.stringify(mockTweet) }]
        });
      } catch (e) {
        // console.error('Kafka send error (expected if offline)');
      }
    }, 45000); // Send mock tweet every 45 seconds
  }
}

module.exports = new TwitterIntegration();
