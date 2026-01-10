# Ken Rotaris Portfolio - Simplified Version 0

A minimalist portfolio website built with Next.js 15 and Rust (Axum).

## Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **TailwindCSS** v4
- **DaisyUI** v5
- **React 19**

### Backend
- **Rust** with Axum framework
- **JSON** data storage (no database)
- **Serde** for serialization

### Deployment
- **Docker** & **Docker Compose**
- Standalone Next.js build
- Multi-stage builds for optimization

## Project Structure

```
ken.rotaris.ch/
├── backend/          # Rust Axum API
│   ├── src/
│   │   ├── main.rs
│   │   ├── models.rs
│   │   ├── handlers.rs
│   │   └── data/
│   │       └── portfolio.json
│   ├── Cargo.toml
│   └── Dockerfile
├── frontend/         # Next.js 15 application
│   ├── app/
│   │   ├── components/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   ├── public/images/
│   └── Dockerfile
└── docker-compose.yml
```

## Features

- **Server-side rendering** with Next.js 15
- **Optimized images** using Next.js Image component
- **Bionic reading** text enhancement
- **Time-based greeting** (Good morning/afternoon/evening)
- **Responsive design** with DaisyUI components
- **Tab navigation** for Projects, Experience, Education
- **Dockerized** for easy deployment

## Development

### Prerequisites
- Node.js 20+
- Rust 1.75+ (optional for local backend development)
- Docker & Docker Compose (for containerized deployment)

### Running Locally (Without Docker)

**Backend:**
```bash
cd backend
cargo run
# Runs on http://localhost:3001
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### Running with Docker

```bash
# Build and start both services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop services
docker-compose down
```

Access the application at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/portfolio

## API Endpoints

- `GET /api/portfolio` - Returns all portfolio data (about, projects, experience, education, social)

## Data Structure

All portfolio data is stored in `backend/src/data/portfolio.json`:

```json
{
  "about": { ... },
  "projects": [ ... ],
  "experience": [ ... ],
  "education": [ ... ],
  "social": { ... }
}
```

## Deployment

1. Update environment variables if needed
2. Build and deploy Docker containers:
   ```bash
   docker-compose up -d --build
   ```
3. Configure Nginx reverse proxy (optional)
4. Set up SSL certificates

## Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

For production, update to your backend URL.

## Migrated Content

All content from the original kenrotaris.dev has been migrated:
- 10 projects
- 4 work experiences
- 7 education entries
- About section with bionic reading
- Social links (LinkedIn, GitHub, Email)

## Future Improvements

- Dark mode toggle
- Search functionality
- Blog section
- Admin panel for content updates
- PostgreSQL database
- CI/CD pipeline
- Analytics integration

## License

Private project - All rights reserved

## Author

Ken Rotaris - Full-Stack Developer
- Website: https://kenrotaris.dev
- LinkedIn: https://www.linkedin.com/in/kenrotaris/
- GitHub: https://github.com/kenrotaris
- Email: info@kenrotaris.dev
