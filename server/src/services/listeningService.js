const { consumer, producer } = require('../config/kafka');
const nlpService = require('./nlpService');
const deduplicationService = require('./deduplicationService');
const SocialReport = require('../models/SocialReport.model');

// Importers
const twitterInt = require('../integrations/social/twitter.integration');
const redditInt = require('../integrations/social/reddit.integration');
const facebookInt = require('../integrations/social/facebook.integration');
const youtubeInt = require('../integrations/social/youtube.integration');
const newsInt = require('../integrations/social/newsScraper.integration');

class ListeningService {
  async startEngine() {
    console.log('[Listening Engine] Booting up...');
    
    // Start producer streams
    twitterInt.startStream(producer);
    redditInt.startPolling(producer);
    facebookInt.startPolling(producer);
    youtubeInt.startPolling(producer);
    newsInt.startPolling(producer);

    try {
      await consumer.subscribe({ topic: 'social-listening-raw', fromBeginning: false });

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const rawData = JSON.parse(message.value.toString());
            await this.processIncomingData(rawData);
          } catch (e) {
            console.error('Error processing Kafka message:', e);
          }
        },
      });
    } catch (e) {
      console.warn('Kafka consumer could not start. Is broker running?');
    }
  }

  async processIncomingData(data) {
    // 1. NLP Processing (Category, Sentiment, Confidence)
    const nlpResult = await nlpService.processText(data.text);
    
    if (!nlpResult.isCivicIssue) return; // Drop irrelevant chatter

    // 2. Prepare Report Object
    const newReport = {
      title: data.text.substring(0, 50) + '...',
      originalText: data.text,
      category: nlpResult.category,
      location: data.location,
      sentiment: nlpResult.sentiment,
      viralityScore: data.upvotes || data.likes || data.virality || 1,
      aiConfidence: nlpResult.confidence,
      sources: [{ platform: data.platform, url: data.url }]
    };

    // 3. Deduplication Check
    const duplicate = await deduplicationService.findDuplicate(newReport);

    if (duplicate) {
      console.log(`[Deduplication] Merging ${data.platform} report into existing issue ${duplicate._id}`);
      await deduplicationService.mergeReports(duplicate, newReport);
    } else {
      console.log(`[New Issue] AI detected a new civic issue from ${data.platform}`);
      
      // Auto-verify if virality is high or AI is extremely confident
      if (newReport.viralityScore > 50 || newReport.aiConfidence > 0.95) {
        newReport.status = 'verified_issue';
        // Note: In reality, we might also auto-create a true `Issue` here.
      }

      await SocialReport.create(newReport);
    }
  }
}

module.exports = new ListeningService();
