# ECELL Marketing Code Quiz

A premium marketing quiz application built with React, Vite, Tailwind CSS, and Supabase.

## Setup Instructions

### 1. Database Setup (Supabase)
1. Create a new Supabase project.
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `database_schema.sql` (found in this project's root) and run it.
   - This creates the `participants`, `quizzes`, and `questions` tables.
   - It also checks for RLS policies and inserts initial dummy data.

### 2. Environment Variables
1. Create a file named `.env` in the root directory (copy from `.env.example` if available).
2. Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### 3. Run the Project
1. Install dependencies (if not already):
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the link shown in the terminal (usually `http://localhost:5173` or `5174`).

## Features
- **Landing Page**: Participants enter their name.
- **Quiz**: 10 Marketing questions. Every 2 correct answers reveal a letter of the secret word.
- **Result**: Premium poster-style result page with download capability.
- **Admin Dashboard**: Access at `/admin` (Password: `ecell2026`). Manage the secret word and questions.

## Tech Stack
- React + Vite
- Tailwind CSS (Luxury Gold/Black Theme)
- Supabase (Database & Auth)
- Framer Motion (Animations)
- html2canvas (Poster Generation)
