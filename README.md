# ClaimBridge Admin Portal

## Tech Stack

-   **Frontend**: Next.js 15 TypeScript
-   **Styling**: Tailwind CSS
-   **Database**: Vercel Postgres
-   **Authentication**: Mock auth system with role switching
-   **Deployment**: Vercel

## Database Schema

### Users Table

```sql
- id: SERIAL PRIMARY KEY
- name: TEXT
- email: TEXT (Unique)
- role: TEXT ('admin' | 'super-admin')
- created_at: TIMESTAMP
```

### Claims Table

```sql
- id: SERIAL PRIMARY KEY
- claimant_name: TEXT
- date: DATE
- status: TEXT ('New' | 'In Review' | 'Closed')
- summary: TEXT
- details: TEXT
- created_at: TIMESTAMP
```

### Claim Notes Table

```sql
- id: SERIAL PRIMARY KEY
- claim_id: INTEGER (Foreign Key to claims.id)
- author_id: TEXT
- note: TEXT
- timestamp: TIMESTAMP
```

## Quick Start

### Prerequisites

-   Node.js 18+ installed
-   A Vercel account

### Set Up Vercel Postgres

1. Go to [vercel.com](https://vercel.com) and create a new project
2. In your project dashboard, go to **Storage** tab
3. Click **Create Database** and select **Postgres**
4. Once created, go to the **Settings** tab of your database
5. Copy all the environment variables

### Environment Configuration

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Vercel Postgres credentials from step 2.

### Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## License

MIT License - feel free to use this code for learning and demonstration purposes.

## Support

This is a demo application. For questions, refer to the code comments and documentation.
