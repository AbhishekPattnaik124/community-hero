const { Kafka } = require('kafkajs');

/**
 * Kafka configuration for the Social Listening Engine.
 * In a real environment, you'd provide brokers from env variables (e.g., Confluent Cloud).
 */
const kafka = new Kafka({
  clientId: 'community-hero-social-listener',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  // ssl: true,
  // sasl: { mechanism: 'plain', username: '...', password: '...' }
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'social-listening-group' });

const connectKafka = async () => {
  try {
    // For this mock/demo environment, we catch connection errors silently
    // to allow the rest of the application to run even if Kafka isn't spun up locally.
    await producer.connect();
    console.log('Kafka Producer connected');
    
    await consumer.connect();
    console.log('Kafka Consumer connected');
  } catch (error) {
    console.warn('Kafka connection failed (Expected if no local broker is running). Social streams will be simulated.');
  }
};

module.exports = {
  kafka,
  producer,
  consumer,
  connectKafka
};
