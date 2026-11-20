# DCS Research Repository System

A React and Express application for managing student research records, manuscript PDFs, academic years, status, and project links. Finished records have abstracts; records in progress have descriptions. Both appear in one Summary column. Search supports all-word matching across record fields, filters, relevance sorting, and highlighted summary matches. Accounts use administrator-created email/password credentials; there is no SSO or self-registration.

## Requirements

- Node.js 20 or newer
- MySQL 8 or compatible

## Database setup

Create the database and table before starting the API:

```sql
CREATE DATABASE dcs_research CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dcs_research;

CREATE TABLE research (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type ENUM('Capstone', 'Thesis') NOT NULL DEFAULT 'Capstone',
  authors TEXT NOT NULL,
  abstract TEXT NOT NULL,
  description TEXT,
  pdf_url VARCHAR(500),
  adviser VARCHAR(255) NOT NULL,
  critic VARCHAR(255) NOT NULL,
  status ENUM('MOR', 'Part A', 'Part B', 'Finished') NOT NULL DEFAULT 'MOR',
  website_url VARCHAR(500),
  academic_year VARCHAR(9),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

For an older research table, add any missing columns before running the app:

```sql
ALTER TABLE research ADD COLUMN type ENUM('Capstone', 'Thesis') NOT NULL DEFAULT 'Capstone';
ALTER TABLE research ADD COLUMN academic_year VARCHAR(9) NULL AFTER website_url;
```

Apply the SQL files in `dcs-rt-api/migrations/` in numeric order, using the same database selected in MySQL Workbench. Migration 003 removes sessions created under the earlier Google sign-in version and converts its user table to local passwords. Migration 004 adds descriptions and moves existing non-Finished abstracts into the description field.

## Run locally

In `dcs-rt-api`, copy `.env.example` to `.env` if you do not already have one, set `DB_PASSWORD` to your MySQL password, then install dependencies:

```powershell
cd dcs-rt-api
# If .env does not exist: Copy-Item .env.example .env
# Edit .env and set DB_PASSWORD.
npm install
```

After applying the migrations, create the first admin account. The script asks for a password without echoing it:

```powershell
cd dcs-rt-api
npm run bootstrap-admin -- admin@example.edu
npm start
```

In a second terminal, run the client:

```powershell
cd dcs-rt-client
npm install
npm run dev
```

Admins create accounts in the **Users & audit log** screen and share initial passwords securely. All passwords must be at least 12 characters. Users can change their own password after signing in. Roles are: viewers can read; editors can add and edit; admins can also delete records, manage user roles and access, and view the audit log. Research changes and user access changes record the actor and before/after values.

The API listens on port `5000` by default. Set `PORT` to change it. Set `VITE_API_URL` only if the client should use an API other than the local development default or configured production API.

## Deploy the frontend

The client is a static Vite app and can be deployed to Vercel or Netlify. Both have free plans; limits and acceptable use apply. Vercel Hobby is for personal, non-commercial use. Netlify Free includes 300 usage credits per month with a hard limit, so a project pauses if it reaches the cap. Check each provider's current plan terms before choosing.

In either provider, import the client repository (or select `dcs-rt-client` as the root directory if deploying from a parent repo) and configure:

- Build command: `npm run build`
- Output/publish directory: `dist`
- Environment variable: `VITE_API_URL=https://YOUR-RAILWAY-API-DOMAIN`

`VITE_API_URL` is embedded into the public frontend at build time. It should contain only the API's public URL, never a secret. Redeploy after changing it. The client can also be hosted on Railway, but Vercel/Netlify are convenient static hosts.

After the first frontend deployment, copy its exact HTTPS origin (no trailing slash) into the Railway API service's `CLIENT_ORIGINS` variable, for example `https://your-site.netlify.app`. If using a custom domain, add that origin too. Redeploy the API after changing variables. This exact-origin setting is required for browser CORS and credentialed sign-in requests.

For Vercel Hobby, the official plan is $0 and restricted to personal/non-commercial use. Netlify Free is $0 with a 300-credit monthly hard limit; projects pause after reaching the cap. Railway hosting is billed separately, and the database, API, volume, and usage are not covered by Vercel or Netlify's frontend free tier.

See the README in the separate `dcs-rt-api` repository for Railway MySQL, migrations, initial admin setup, and persistent PDF storage. The API accepts PDFs up to 10 MB. Attach a Railway Volume to the API and set `UPLOADS_DIR` to its mount path so uploaded files survive redeployments. Back up the uploaded files separately from MySQL.

## API routes

- `POST /api/auth/login` - sign in with email and password
- `GET /api/auth/me` - get the signed-in user
- `POST /api/auth/password` - change the current password
- `POST /api/auth/logout` - end the session
- `GET /api/research` - list records
- `POST /api/research` - create a record (editor/admin)
- `PUT /api/research/:id` - update a record (editor/admin)
- `DELETE /api/research/:id` - delete a record (admin)
- `GET /api/users`, `POST /api/users`, and `PATCH /api/users/:id` - admin user management
- `GET /api/users/audit-logs` - admin change history
