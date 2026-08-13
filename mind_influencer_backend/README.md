# Mind Influencer Reviews Backend

A minimal, production-ready Flask API for collecting and moderating student reviews
on the Mind Influencer coaching website.

**Completely separate from the Canaan system.**

---

## Project structure

```
mind_influencer_backend/
├── app.py                  Flask application factory
├── config.py               Configuration (reads env vars)
├── extensions.py           SQLAlchemy + CORS extension singletons
├── models.py               Review + AdminUser SQLAlchemy models
├── auth.py                 JWT helper (generate / verify admin tokens)
├── routes_public.py        POST /api/reviews, GET /api/reviews
├── routes_admin.py         Admin login + moderation endpoints
├── init_db.py              One-time database initialisation script
├── requirements.txt        Python dependencies
├── .env.example            Template for environment variables
├── frontend_example.js     Copy-paste JS snippets for script.js
└── reviews.db              (created on first run — gitignore this)
```

---

## Quick start

### 1 — Create and activate a virtual environment

```bash
cd mind_influencer_backend
python -m venv .venv

# Windows PowerShell
.\.venv\Scripts\Activate.ps1

# Mac / Linux
source .venv/bin/activate
```

### 2 — Install dependencies

```bash
pip install -r requirements.txt
```

### 3 — Configure secrets (optional for local dev)

```bash
# Copy the template
copy .env.example .env        # Windows
cp  .env.example .env         # Mac/Linux

# Edit .env and change the SECRET_KEY / JWT_SECRET_KEY values
```

### 4 — Initialise the database (run ONCE)

```bash
python init_db.py
```

Output:
```
✅  Database tables created.
✅  Default admin created:
    Email   : admin@mindinfluencer.com
    Password: ChangeMe@2024!

⚠️   IMPORTANT: Log in and change this password immediately!
```

### 5 — Start the development server

```bash
flask --app app run --port 5001 --debug
# — or —
python app.py
```

The API is now available at: **http://localhost:5001**

---

## API reference

### Public endpoints

#### `POST /api/reviews` — Submit a review

```bash
curl -X POST http://localhost:5001/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "student_name": "Priya M.",
    "course":       "IELTS",
    "rating":       5,
    "title":        "Achieved Band 7.5!",
    "body":         "The coaching sessions were incredibly structured and the mock tests were spot on."
  }'
```

**201 response:**
```json
{
  "success": true,
  "message": "Thank you! Your review is submitted and will be visible after approval."
}
```

**400 validation error:**
```json
{ "success": false, "error": "rating must be between 1 and 5." }
```

---

#### `GET /api/reviews` — List approved reviews

```bash
# All approved reviews
curl http://localhost:5001/api/reviews

# Filter by course
curl "http://localhost:5001/api/reviews?course=OET"

# With pagination
curl "http://localhost:5001/api/reviews?offset=10&limit=10"
```

**200 response:**
```json
{
  "reviews": [
    {
      "id":           1,
      "student_name": "Priya M.",
      "course":       "IELTS",
      "rating":       5,
      "title":        "Achieved Band 7.5!",
      "body":         "The coaching sessions were incredibly structured...",
      "created_at":   "2026-08-12T18:30:00Z"
    }
  ],
  "total": 1
}
```

---

### Admin endpoints

All admin routes require:
```
Authorization: Bearer <your-jwt-token>
```

#### `POST /api/admin/login` — Get a JWT

```bash
curl -X POST http://localhost:5001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@mindinfluencer.com", "password": "ChangeMe@2024!"}'
```

**200 response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": { "id": 1, "name": "Mind Influencer Admin", "email": "admin@mindinfluencer.com" }
}
```

---

#### `GET /api/admin/reviews` — All reviews (incl. pending)

```bash
curl http://localhost:5001/api/admin/reviews \
  -H "Authorization: Bearer <token>"

# Only pending:
curl "http://localhost:5001/api/admin/reviews?is_approved=false" \
  -H "Authorization: Bearer <token>"
```

---

#### `PATCH /api/admin/reviews/<id>` — Approve / reject

```bash
# Approve review #1
curl -X PATCH http://localhost:5001/api/admin/reviews/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"is_approved": true, "admin_notes": "Verified student"}'

# Reject review #2
curl -X PATCH http://localhost:5001/api/admin/reviews/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"is_approved": false, "admin_notes": "Spam"}'
```

**200 response:**
```json
{
  "success": true,
  "review": {
    "id": 1, "student_name": "Priya M.", "course": "IELTS",
    "rating": 5, "title": "...", "body": "...",
    "is_approved": true, "admin_notes": "Verified student",
    "created_at": "2026-08-12T18:30:00Z"
  }
}
```

---

#### `DELETE /api/admin/reviews/<id>` — Delete permanently

```bash
curl -X DELETE http://localhost:5001/api/admin/reviews/2 \
  -H "Authorization: Bearer <token>"
```

---

#### `POST /api/admin/users` — Create a new admin

```bash
curl -X POST http://localhost:5001/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "Jane", "email": "jane@mindinfluencer.com", "password": "SecurePass@99"}'
```

---

## Frontend integration

Copy the functions from `frontend_example.js` into your static site`s `script.js`.
Then in your `DOMContentLoaded` handler, call:

```js
const BACKEND_URL = "http://localhost:5001"; // change before deploying

loadReviews();        // fetches + renders approved reviews
initReviewFilters();  // wires up course filter pill buttons
initReviewForm();     // wires up Write-a-Review form
```

---

## Production checklist

- [ ] Set `FLASK_SECRET_KEY` and `JWT_SECRET_KEY` to random 50+ char strings
- [ ] Set `CORS_ORIGINS` to your actual frontend domain (not `*`)
- [ ] Change the default admin password immediately after `init_db.py`
- [ ] Run behind **gunicorn** (not Flask dev server): `gunicorn "app:create_app()" --bind 0.0.0.0:5001 --workers 2`
- [ ] Put **nginx** or **Caddy** in front for HTTPS
- [ ] Migrate from SQLite to **PostgreSQL** for production: set `DATABASE_URL` env var
- [ ] Add `.env` to `.gitignore` — never commit secrets
