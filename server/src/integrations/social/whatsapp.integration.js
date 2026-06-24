/**
 * WhatsApp Business API Integration
 * Webhook receiver for citizens forwarding civic issues.
 */
class WhatsAppIntegration {
  /**
   * Handle incoming WhatsApp webhooks from Meta
   */
  async handleWebhook(req, res, kafkaProducer) {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      try {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const message = changes?.value?.messages?.[0];
        const contact = changes?.value?.contacts?.[0];

        if (message) {
          const mockWhatsappData = {
            platform: 'whatsapp',
            id: `wa-${message.id}`,
            text: message.text?.body || '[Media Message]',
            authorId: contact?.wa_id || 'unknown_wa_user',
            createdAt: new Date(),
            verifiedUser: true, // WhatsApp is verified by phone number
            // Would normally extract location from message.location if sent
            location: message.location ? {
              type: 'Point',
              coordinates: [message.location.longitude, message.location.latitude]
            } : null
          };

          await kafkaProducer.send({
            topic: 'social-listening-raw',
            messages: [{ value: JSON.stringify(mockWhatsappData) }]
          });
        }
      } catch (e) {
        console.error('Error processing WhatsApp webhook', e);
      }
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  }
}

module.exports = new WhatsAppIntegration();
