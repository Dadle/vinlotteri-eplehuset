# Plan: Wine Lottery Website for Eplehuset

Build an internal wine lottery web application using React/TypeScript frontend with Django REST backend, deployed as a single Docker container. Participants enter with name and ticket count, select from 4 draw algorithms, and view statistics via custom SVG/CSS visualizations.

## Steps

### 1. Create project structure
Set up `/backend` (Django project) and `/frontend` (Vite React app) directories, plus root-level `Dockerfile`, `docker-compose.yml`, and `start.sh` script.

### 2. Set up Django backend
Configure Django REST Framework with models:
- `Employee` (name, email, is_active, created_at)
- `Draw` (name, algorithm_used, winner_id, performed_at)
- `DrawParticipant` (draw_id, employee_id, ticket_count)
- API endpoints for CRUD, draw execution, and statistics aggregation

### 3. Implement 4 draw algorithms
Selectable via dropdown (default: pure random):
- **Pure Random**: Each ticket = one entry, random selection weighted by ticket count
- **Weighted by Losses**: Employees with fewer historical wins get bonus weight
- **Round-Robin Fair**: Prioritize employees who haven't won recently
- **Equal Chance**: Ignore ticket count, each participant has equal probability

### 4. Build participant management UI
Two import methods:
- Text area for pasting (format: `Name, tickets` per line)
- CSV file upload with drag-and-drop support
- Inline editing to adjust names/ticket counts before draw

### 5. Create winner reveal animation
Use Motion (Framer Motion) for spinning name carousel effect and react-confetti for silent celebration—no sound.

### 6. Build statistics dashboard
- HTML tables showing draw history and per-employee win counts
- Custom SVG bar chart for wins distribution
- CSS-styled pie chart (using conic-gradient) for win percentage breakdown

### 7. Configure Docker deployment
Multi-stage Dockerfile with:
- Node build stage for React
- Python runtime stage with WhiteNoise for static files
- SQLite volume persistence at `/data/db.sqlite3`
- Entrypoint script running migrations automatically
- One-command start: `docker-compose up --build`

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Animation | Motion (Framer Motion), react-confetti |
| Backend | Python 3.12, Django 5, Django REST Framework |
| Database | SQLite with Django ORM |
| Deployment | Docker, docker-compose, WhiteNoise, Gunicorn |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees/` | List all employees |
| POST | `/api/employees/` | Create employee |
| PUT | `/api/employees/{id}/` | Update employee |
| DELETE | `/api/employees/{id}/` | Delete employee |
| GET | `/api/draws/` | List all draws |
| POST | `/api/draws/` | Create new draw |
| POST | `/api/draws/{id}/perform/` | Execute draw with selected algorithm |
| GET | `/api/statistics/` | Get win statistics |

## File Structure
vinlotteri/
├── backend/
│ ├── manage.py
│ ├── requirements.txt
│ ├── vinlotteri/
│ │ ├── settings.py
│ │ ├── urls.py
│ │ └── wsgi.py
│ └── api/
│ ├── models.py
│ ├── serializers.py
│ ├── views.py
│ └── urls.py
├── frontend/
│ ├── package.json
│ ├── vite.config.ts
│ ├── index.html
│ └── src/
│ ├── main.tsx
│ ├── App.tsx
│ ├── api/
│ ├── components/
│ └── pages/
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md

