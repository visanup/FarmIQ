# Vision Inference Service

Vision Inference Service provides a FastAPI application for running poultry weight inference on the edge. It receives metadata about captured images, triggers the model pipeline, and records predictions in the shared PostgreSQL instance using Prisma (Python client).

## Features
- FastAPI service with `/inference` and `/health` endpoints
- Prisma-backed persistence for inference jobs and predictions in the `edge_vision` schema
- Pluggable Torch-based weight inference engine with a safe heuristic fallback while the ML artefact is under development

## Getting Started
1. Install dependencies
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # source .venv/bin/activate  # Linux/macOS
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
2. Configure environment
   ```bash
   copy .env.example .env  # Windows
   # cp .env.example .env   # Linux/macOS
   ```
3. Generate Prisma client
   ```bash
   python -m prisma generate
   ```
4. Run the service locally
   ```bash
   uvicorn src.main:app --host 0.0.0.0 --port 6306 --reload
   ```

## Docker Usage
```bash
docker build -t vision-inference-service .
docker run --rm -p 6306:6306 --env-file .env vision-inference-service
```

## Environment Variables
| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma |
| `ENVIRONMENT` | No | Deployment environment label (`development` by default) |
| `VISION_MODEL_PATH` | No | Path to the Torch model to load (`models/latest.pt`) |
| `LOG_LEVEL` | No | Logging level (defaults to `INFO`) |

## API
- `GET /health` - readiness probe returning service status
- `POST /inference` - triggers an inference job and returns predicted weight, confidence, and model version

## ML Model Placeholder
The engine looks for a model at `VISION_MODEL_PATH`. If no model is present (for example during development), the service falls back to a heuristic that echoes any `approx_weight_kg` supplied in the request metadata. Update `src/services/inference.py` once the real Torch model contract is finalised.
