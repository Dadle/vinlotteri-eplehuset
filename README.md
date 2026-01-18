# Eplehuset Wine Lottery

An internal wine lottery web application for Eplehuset. Participants enter with name and ticket count, select from 4 draw algorithms, and view statistics via custom visualizations.

## Features

- **Multiple Import Methods**: Paste text or upload CSV files with drag-and-drop support
- **4 Draw Algorithms**:
  - Pure Random (weighted by tickets)
  - Weighted by Losses (bonus for fewer wins)
  - Round-Robin Fair (prioritizes those who haven't won recently)
  - Equal Chance (ignores ticket count)
- **Wine Management**: Admin interface to manage wine catalog
- **Preview Mode**: Dry-run to see who would win without committing
- **Winner Animation**: Spectacular gold shimmer reveal with confetti
- **Statistics Dashboard**: SVG bar charts and CSS pie charts
- **Dark Mode**: Toggle between light and dark themes
- **Export**: Download statistics as CSV

---

## 🚀 Production Deployment

### Prerequisites: Install Docker on macOS

1. **Download Docker Desktop** from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)

2. **Install** by dragging Docker to Applications

3. **Launch Docker Desktop** and wait for it to start (whale icon in menu bar)

4. **Verify installation**:
   ```bash
   docker --version
   docker compose version
   ```

### Run in Production

```bash
# Clone the repository
git clone https://github.com/your-org/vinlotteri.git
cd vinlotteri

# Build and start the production container
docker compose up --build -d

# Access the app at http://localhost:8085
```

**Managing the production server:**

```bash
# View logs
docker compose logs -f

# Stop the server
docker compose down

# Restart after changes
docker compose up --build -d
```

---

## 🛠️ Development Setup

### Option 1: Docker Development (Recommended)

This method provides hot reload for both frontend and backend.

```bash
# Start development environment
docker compose -f docker-compose.dev.yml up --build

# Frontend: http://localhost:5173 (Vite with HMR)
# Backend API: http://localhost:8001 (Django with auto-reload)
```

Changes to files in `frontend/` and `backend/` automatically reload in the browser.

**Useful commands:**

```bash
# View logs
docker compose -f docker-compose.dev.yml logs -f

# Restart a specific service
docker compose -f docker-compose.dev.yml restart frontend

# Stop development environment
docker compose -f docker-compose.dev.yml down

# Rebuild after dependency changes
docker compose -f docker-compose.dev.yml up --build
```

### Option 2: Local Development (without Docker)

#### Backend (Django with uv)

```bash
cd backend

# Install uv (fast Python package manager)
# macOS/Linux:
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows PowerShell:
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Create virtual environment and install dependencies
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

#### Frontend (React with pnpm)

```bash
cd frontend

# Install pnpm
corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
pnpm install

# Start development server with hot reload
pnpm dev
```

---

## 🤖 Development with Claude Code (Dev Container)

Use Claude Code inside a Dev Container for an AI-powered development experience.

### Prerequisites

1. **VS Code** or **Cursor** IDE
2. **Docker Desktop** running
3. **Dev Containers extension** installed in your IDE

### Setup Dev Container

1. **Create the dev container configuration:**

   Create `.devcontainer/devcontainer.json`:

   ```json
   {
     "name": "Vinlotteri Dev",
     "dockerComposeFile": ["../docker-compose.dev.yml", "docker-compose.extend.yml"],
     "service": "frontend",
     "workspaceFolder": "/workspace",
     "customizations": {
       "vscode": {
         "extensions": [
           "ms-python.python",
           "ms-python.vscode-pylance",
           "dbaeumer.vscode-eslint",
           "esbenp.prettier-vscode",
           "bradlc.vscode-tailwindcss"
         ],
         "settings": {
           "python.defaultInterpreterPath": "/usr/local/bin/python",
           "editor.formatOnSave": true
         }
       }
     },
     "forwardPorts": [5173, 8001],
     "postCreateCommand": "pnpm install"
   }
   ```

2. **Create the extension compose file:**

   Create `.devcontainer/docker-compose.extend.yml`:

   ```yaml
   services:
     frontend:
       volumes:
         - ..:/workspace:cached
       command: sleep infinity
   ```

3. **Open in Dev Container:**
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Select "Dev Containers: Reopen in Container"
   - Wait for the container to build and start

4. **Start development servers inside the container:**

   ```bash
   # Terminal 1: Frontend
   cd /workspace/frontend && pnpm dev --host 0.0.0.0

   # Terminal 2: Backend (in a new terminal)
   cd /workspace/backend && python manage.py runserver 0.0.0.0:8000
   ```

### Using Claude Code

Once inside the dev container, Claude Code can:

- Edit files across the entire codebase
- Run terminal commands
- Test changes in real-time with hot reload
- Access both frontend and backend services

**Tips for working with Claude:**

- Ask Claude to make changes and test them immediately in the browser
- Use `docker compose logs` to debug issues
- Claude can run the full test suite and fix failing tests

---

## 📚 Reference

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Animation | Framer Motion, react-confetti |
| Backend | Python 3.12, Django 5, Django REST Framework |
| Database | SQLite with Django ORM |
| Package Managers | uv (Python), pnpm (Node) |
| Deployment | Docker, docker-compose, WhiteNoise, Gunicorn |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wines/` | List all wines |
| POST | `/api/wines/` | Add new wine |
| PATCH | `/api/wines/{id}/` | Update wine |
| DELETE | `/api/wines/{id}/` | Delete wine |
| GET | `/api/draws/` | List all draws |
| POST | `/api/draws/` | Create draw with participants |
| POST | `/api/draws/{id}/perform/` | Execute draw |
| POST | `/api/draws/{id}/preview/` | Preview draw (dry run) |
| POST | `/api/draws/{id}/void/` | Void a draw (within 5 min) |
| GET | `/api/statistics/` | Get win statistics |
| GET | `/api/statistics/export/` | Export stats as CSV |
| GET | `/api/algorithms/` | List available algorithms |

### Project Structure

```
vinlotteri/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── vinlotteri/          # Django project settings
│   └── lottery/             # Main app
│       ├── models.py        # Wine, Draw, DrawParticipant
│       ├── algorithms.py    # 4 draw algorithms
│       ├── views.py         # API views
│       └── serializers.py   # DRF serializers
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── components/      # UI components
│       ├── pages/           # Page components
│       ├── hooks/           # Custom hooks
│       └── api/             # API client
├── .devcontainer/           # Dev Container config
├── Dockerfile               # Production build
├── Dockerfile.dev           # Development with hot reload
├── docker-compose.yml       # Production
├── docker-compose.dev.yml   # Development
└── start.sh
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DJANGO_SECRET_KEY` | dev-key | Secret key for Django |
| `DJANGO_DEBUG` | True | Debug mode |
| `DJANGO_ALLOWED_HOSTS` | localhost,127.0.0.1 | Allowed hosts |
| `DATABASE_PATH` | db.sqlite3 | SQLite database path |
| `VINMONOPOLET_API_KEY` | (none) | API key for Vinmonopolet wine search |

---

## 🍷 Vinmonopolet API Setup (Optional)

The wine search feature uses Vinmonopolet's official API. To enable it:

1. **Register** at [Vinmonopolet API Portal](https://api.vinmonopolet.no/)
2. **Sign in** and go to your profile
3. **Subscribe** to the "Products" API
4. **Copy** your API key (Ocp-Apim-Subscription-Key)
5. **Set** the environment variable:

```bash
# Option 1: Create a .env file in the project root
echo "VINMONOPOLET_API_KEY=your-api-key-here" > .env

# Option 2: Export directly (macOS/Linux)
export VINMONOPOLET_API_KEY=your-api-key-here

# Option 3: Set in PowerShell (Windows)
$env:VINMONOPOLET_API_KEY="your-api-key-here"
```

Then restart the application. The "Søk i Vinmonopolet" button in the Wine Cellar will now search Vinmonopolet's catalog.

> **Note:** Without an API key, the wine search feature will show an error message. You can still add wines manually.

---

## 📄 License

Internal use only - Eplehuset
