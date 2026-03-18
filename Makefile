.PHONY: install install-backend install-frontend dev-backend dev-frontend dev clean

# ── Paths (all relative to project root) ─────────────────────────────────────
VENV_DIR   := backend/venv
PIP        := $(VENV_DIR)/bin/pip
# uvicorn is invoked from inside backend/, so path is relative to that dir:
UVICORN    := venv/bin/uvicorn

# ─────────────────────────────────────────────────────────────────────────────
# Install
# ─────────────────────────────────────────────────────────────────────────────

install: install-backend install-frontend
	@echo "\n✅  All dependencies installed."
	@echo "    Copy backend/.env.example → backend/.env and add your API key"
	@echo "    Then run:  make dev\n"

install-backend:
	@echo "→ Setting up Python virtualenv inside backend/…"
	python3 -m venv $(VENV_DIR)
	$(PIP) install --upgrade pip --quiet
	$(PIP) install -r backend/requirements.txt
	@echo "✔ Backend dependencies installed."

install-frontend:
	@echo "→ Installing Node dependencies…"
	cd frontend && npm install
	@echo "✔ Frontend dependencies installed."

# ─────────────────────────────────────────────────────────────────────────────
# Run
# ─────────────────────────────────────────────────────────────────────────────

dev-backend:
	@echo "→ Starting FastAPI backend on http://localhost:8000 …"
	cd backend && $(UVICORN) main:app --reload --port 8000

dev-frontend:
	@echo "→ Starting Vite dev server on http://localhost:5173 …"
	cd frontend && npm run dev

# Run both concurrently (POSIX shell — works on macOS zsh / Linux bash)
dev:
	@echo "→ Starting HR Policy Assistant (backend + frontend) …"
	@echo "   Backend  → http://localhost:8000"
	@echo "   Frontend → http://localhost:5173"
	@( \
		trap 'kill 0' INT TERM; \
		(cd backend && $(UVICORN) main:app --reload --port 8000) & \
		(cd frontend && npm run dev) & \
		wait \
	)

# ─────────────────────────────────────────────────────────────────────────────
# Utility
# ─────────────────────────────────────────────────────────────────────────────

clean:
	@echo "→ Cleaning build artifacts…"
	rm -rf $(VENV_DIR)
	rm -rf frontend/node_modules frontend/dist
	@echo "✔ Clean complete."