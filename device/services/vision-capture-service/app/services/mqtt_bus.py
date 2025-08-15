# app/services/mqtt_bus.py
import json
import logging
import threading
from urllib.parse import urlparse
import paho.mqtt.client as mqtt

log = logging.getLogger("mqtt")

class MqttBus:
    """
    ใช้ได้ 2 แบบ:
      - ให้ url=... (เดิม)
      - หรือให้ parsed={host,port,username,password,tls}
    """
    def __init__(self, client_id: str, lwt_topic: str, qos: int = 1, keepalive: int = 30,
                 url: str | None = None, parsed: dict | None = None):
        if parsed:
            self.host = parsed.get("host", "localhost")
            self.port = parsed.get("port", 1883)
            self.username = parsed.get("username") or None
            self.password = parsed.get("password") or None
            self.tls = bool(parsed.get("tls", False))
        else:
            parsed_url = urlparse(url or "mqtt://localhost:1883")
            self.host = parsed_url.hostname or "localhost"
            self.port = parsed_url.port or (8883 if parsed_url.scheme == "mqtts" else 1883)
            self.username = parsed_url.username
            self.password = parsed_url.password
            self.tls = parsed_url.scheme == "mqtts"

        self.qos = qos
        self.keepalive = keepalive

        self.client = mqtt.Client(client_id=client_id, clean_session=False)
        if self.username:
            self.client.username_pw_set(self.username, self.password)
        if self.tls:
            self.client.tls_set()  # ปรับ CA/verify ตามการใช้งานจริง

        # LWT: online:false (retained)
        self.client.will_set(lwt_topic, json.dumps({"schema": "device_status@1", "online": False}),
                             qos=self.qos, retain=True)
        self._on_cmd = None

        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self._loop_thread: threading.Thread | None = None

    def connect(self):
        self.client.connect(self.host, self.port, keepalive=self.keepalive)
        if self._loop_thread is None:
            self._loop_thread = threading.Thread(target=self.client.loop_forever, daemon=True)
            self._loop_thread.start()

    def publish_json(self, topic: str, payload: dict, retain: bool = False):
        self.client.publish(topic, json.dumps(payload), qos=self.qos, retain=retain)

    def set_cmd_handler(self, topic: str, handler):
        self._on_cmd = (topic, handler)
        self.client.subscribe(topic, qos=self.qos)

    # ===== callbacks =====
    def _on_connect(self, client, userdata, flags, rc):
        log.info("MQTT connected rc=%s", rc)
        # online:true (retained)
        topic = self.client._will.topic.decode() if self.client._will else None
        if topic:
            self.publish_json(topic, {"schema": "device_status@1", "online": True}, retain=True)
        if self._on_cmd:
            self.client.subscribe(self._on_cmd[0], qos=self.qos)

    def _on_message(self, client, userdata, msg):
        try:
            if self._on_cmd and msg.topic == self._on_cmd[0]:
                import json as _json
                payload = _json.loads(msg.payload.decode("utf-8"))
                self._on_cmd[1](payload)
        except Exception as e:
            log.exception("Error handling MQTT message on %s: %s", msg.topic, e)
