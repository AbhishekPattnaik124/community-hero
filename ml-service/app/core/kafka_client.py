import json
import logging
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from app.core.config import settings

logger = logging.getLogger(__name__)

class KafkaManager:
    def __init__(self):
        self.producer = None
        self.consumer = None

    async def start(self):
        try:
            self.producer = AIOKafkaProducer(
                bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                request_timeout_ms=5000,
                api_version="auto",
                retry_backoff_ms=500
            )
            await self.producer.start()
            logger.info("Kafka Producer started")
        except Exception as e:
            logger.error(f"Failed to start Kafka Producer: {e}")
            self.producer = None

    async def stop(self):
        if self.producer:
            await self.producer.stop()
            logger.info("Kafka Producer stopped")

    async def send_message(self, topic: str, message: dict):
        if self.producer:
            try:
                await self.producer.send_and_wait(topic, message)
            except Exception as e:
                logger.error(f"Failed to send message to Kafka: {e}")
        else:
            logger.warning("Kafka Producer is not active. Skipping message.")

kafka_manager = KafkaManager()
