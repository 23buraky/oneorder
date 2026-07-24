# ONE ORDER

**ONE KITCHEN. ENDLESS CHOICES.**

Premium restaurant ordering platform for Antwerp, Belgium. Built to production standards comparable to Uber Eats, Deliveroo, and Domino's.

🔗 https://oneorderantwerp.com

## Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, TailwindCSS, Framer Motion, GSAP, Shadcn UI
- **Backend**: NestJS, MySQL/MariaDB, Prisma ORM, Redis, Socket.io
- **Auth**: Auth.js, Google/Apple OAuth, JWT, email verification
- **Payments**: Stripe (Bancontact, iDEAL, cards, Apple Pay, Google Pay)
- **Media**: Cloudinary
- **Email**: Resend
- **Push**: Firebase Cloud Messaging
- **Infra**: Docker, Vercel, GitHub Actions, pnpm + Turborepo

## Monorepo structure

```
one-order/
├── apps/
│   ├── web/          # Next.js 15 customer + admin frontend
│   └── api/           # NestJS REST API + Socket.io gateway
├── packages/
│   ├── database/       # Prisma schema, migrations, seed scripts
│   ├── types/           # Shared TypeScript types & DTOs
│   ├── config/          # Shared eslint/tsconfig/tailwind config
│   ├── ui/               # Shared UI primitives (optional cross-app)
│   └── utils/            # Shared utility functions
├── .github/workflows/     # CI/CD pipelines
├── docker/                 # Dockerfiles & compose
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Getting started

```bash
pnpm install
cp .env.example .env       # fill in real secrets
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Frontend: http://localhost:3000
API: http://localhost:4000

## Languages

Dutch (default) · English · French · Turkish

## Development status

This project is being built incrementally, module by module. See project docs for the current build phase.
