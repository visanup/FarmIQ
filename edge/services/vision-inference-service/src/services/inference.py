"""Inference utilities for the vision inference service."""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

try:  # Torch is optional during early development
    import torch
except Exception:  # pragma: no cover - torch import is optional when developing locally
    torch = None  # type: ignore[assignment]

logger = logging.getLogger(__name__)


@dataclass
class PredictionResult:
    predicted_weight: float
    confidence: float
    inference_time_ms: int
    model_version: str


class WeightInferenceEngine:
    """Facade around the ML model used for weight inference."""

    def __init__(self, model_path: str) -> None:
        self.model_path = Path(model_path)
        self.device = "cpu"
        self._model: Optional[object] = None

    def load(self) -> None:
        """Load the weight inference model if available."""
        if not self.model_path.exists():
            logger.warning("Model file %s not found; using heuristic fallback", self.model_path)
            return

        if torch is None:
            logger.warning("Torch is not available; skipping model load")
            return

        try:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            self._model = torch.jit.load(self.model_path)  # type: ignore[attr-defined]
            self._model.to(self.device)
            self._model.eval()
            logger.info("Loaded model from %s on %s", self.model_path, self.device)
        except Exception as exc:  # pragma: no cover - best effort logging
            logger.error("Failed to load model: %s", exc, exc_info=True)
            self._model = None

    def predict(self, approximation_hint: Optional[float] = None) -> PredictionResult:
        """Run inference using the loaded model or a heuristic fallback."""
        start = time.perf_counter()
        if self._model is None:
            predicted_weight = float(approximation_hint or 0.0)
            confidence = 0.0
            model_version = "heuristic"
        else:  # pragma: no branch - real inference path when model exists
            raise NotImplementedError(
                "Real inference path not implemented. Update WeightInferenceEngine.predict"
                " once the model contract is defined."
            )

        elapsed_ms = int((time.perf_counter() - start) * 1000)
        return PredictionResult(
            predicted_weight=predicted_weight,
            confidence=confidence,
            inference_time_ms=elapsed_ms,
            model_version=model_version,
        )


engine: Optional[WeightInferenceEngine] = None


def get_engine(model_path: str) -> WeightInferenceEngine:
    """Return a singleton inference engine instance."""
    global engine
    if engine is None:
        engine = WeightInferenceEngine(model_path=model_path)
        engine.load()
    return engine
