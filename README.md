# Restaurant QR Menu

Modern bilingual (EN/AR) digital menu with a secure admin dashboard, built with Next.js + Prisma + SQLite.

## Features

- Mobile-first premium menu UI with smooth interactions
- English/Arabic switch with RTL layout support
- Search and category filtering
- Dark mode toggle
- Out-of-stock item support
- Scan analytics (tracks menu opens)
- Admin dashboard for category and item management
- QR code generation for the menu link

## Quick Start

1. Install dependencies: `npm install`
2. Generate Prisma client: `.\node_modules\.bin\prisma.cmd generate`
3. Create/update DB schema: `.\node_modules\.bin\prisma.cmd db push`
4. Run app: `npm run dev`

Open:
- Menu: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

## Environment

Copy `.env.example` into `.env` and adjust values for production.

Default local admin credentials:
- `ADMIN_USERNAME=admin`
- `ADMIN_PASSWORD=admin123`
