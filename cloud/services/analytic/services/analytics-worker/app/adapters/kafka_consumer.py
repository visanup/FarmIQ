# app/adapters/kafka_consumer.py
from confluent_kafka import Consumer
from app.config import Config

def build_consumer() -> Consumer:
    conf = {
        "bootstrap.servers": Config.KAFKA_BROKERS,
        "group.id": Config.CONSUMER_GROUP,
        "client.id": Config.KAFKA_CLIENT_ID,
        "auto.offset.reset": "earliest",
        "enable.auto.commit": False,
        "allow.auto.create.topics": True,
    }
    c = Consumer(conf)
    c.subscribe(Config.KAFKA_TOPICS)
    return c

