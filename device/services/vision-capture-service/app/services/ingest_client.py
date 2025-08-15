# edge\services\vision-capture-service\app\services\ingest_client.py
import time
import hmac
import base64
import hashlib
from uuid import uuid4
from urllib.parse import urlparse
from pathlib import Path
import requests

class IngestClient:
    """
    ใช้ได้ 2 โหมด:
    - API Key ธรรมดา: ส่ง header 'X-API-Key'
    - API Key + HMAC: ลงลายเซ็นกันปลอม/กันรีเพลย์
      ส่ง headers: X-API-Key-Id, X-Signature, X-Timestamp, X-Nonce, X-Content-SHA256
      signature = HMAC_SHA256(API_KEY, f"{method}\n{path}\n{ts}\n{sha256}\n{nonce}")
    """
    def __init__(
        self,
        base_url: str,
        api_path: str,
        token: str = "",                 # ยังรองรับ Bearer เผื่อใช้ร่วมกับ gateway
        api_key: str = "",               # PSK
        api_key_id: str = "",            # ใช้คู่กับ HMAC
        use_request_signing: bool = False,
        verify_tls: bool = False,
        timeout_sec: int = 30,
    ):
        self.url = base_url.rstrip("/") + api_path
        self.token = token
        self.api_key = api_key
        self.api_key_id = api_key_id
        self.use_signing = use_request_signing and bool(api_key and api_key_id)
        self.verify = verify_tls
        self.timeout = timeout_sec
        self._parsed = urlparse(self.url)

    def _sha256_file(self, fp: Path) -> str:
        h = hashlib.sha256()
        with open(fp, "rb") as f:
            for chunk in iter(lambda: f.read(1024 * 1024), b""):
                h.update(chunk)
        return h.hexdigest()

    def _auth_headers(self, method: str, content_sha256: str) -> dict:
        headers = {}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        if self.use_signing:
            ts = str(int(time.time()))
            nonce = str(uuid4())
            path = self._parsed.path or "/"
            msg = f"{method}\n{path}\n{ts}\n{content_sha256}\n{nonce}"
            sig = hmac.new(
                key=self.api_key.encode("utf-8"),
                msg=msg.encode("utf-8"),
                digestmod=hashlib.sha256,
            ).digest()
            headers.update({
                "X-API-Key-Id": self.api_key_id,
                "X-Signature": base64.b64encode(sig).decode("ascii"),
                "X-Timestamp": ts,
                "X-Nonce": nonce,
                "X-Content-SHA256": content_sha256,
            })
        elif self.api_key:
            headers["X-API-Key"] = self.api_key

        return headers

    def upload(self, file_path: Path, metadata: dict) -> dict:
        # ใช้ sha256 จาก metadata ถ้ามี เพื่อความสอดคล้องกับ event; ไม่มีก็คำนวณใหม่
        content_sha256 = str(metadata.get("sha256") or self._sha256_file(file_path))
        headers = self._auth_headers("POST", content_sha256)

        data = {k: str(v) for k, v in metadata.items()}
        # ควรปิดไฟล์เสมอ -> ใช้ context manager
        mime = "image/jpeg"
        if file_path.suffix.lower() == ".png":
            mime = "image/png"

        with open(file_path, "rb") as f:
            files = {"file": (file_path.name, f, mime)}
            r = requests.post(
                self.url,
                headers=headers,
                files=files,
                data=data,
                timeout=self.timeout,
                verify=self.verify,
            )
        r.raise_for_status()
        return r.json()
