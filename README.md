# CogniBloom – Active Learning Tutor

CogniBloom is a small AI-tutor learning experience built around one active-learning moment. It helps address the gap between reading an explanation and being able to demonstrate understanding by asking the student to explain the concept in their own words. The prototype keeps the learning loop focused and uses deterministic mocked learning behavior so it can be tested reliably.

## Problem

An AI tutor can answer a question correctly, but receiving an answer does not prove that the student understood it. A student may read an explanation, feel that it makes sense, and leave without being able to reconstruct the idea independently.

## Solution

CogniBloom implements this learning loop:

```text
Student asks a question
→ Explanation
→ Explain-it-yourself concept check
→ Evaluation
→ Feedback
→ Retry / Completion
```

The product intentionally focuses on one small active-learning interaction instead of trying to become a complete tutoring platform. The goal is to make the transition from explanation to demonstrated understanding clear and low-friction.

## Key Features

- Topic and question input
- AI-style explanation using deterministic mocked learning behavior
- Explain-it-yourself concept check
- Correct, partially correct, and incorrect evaluation
- Targeted feedback
- Retry flow with attempt tracking
- Skip flow with a separate incomplete state
- Learning-session and interaction persistence through the backend
- Active-session restoration after refresh using local storage
- Responsive UI with semantic form controls and visible focus states
- API validation and error handling
- Loading states and backend-unavailable messaging

Authentication, analytics dashboards, real external AI, adaptive learning engines, and multi-user learning history are not implemented features.

## User Flow

```text
Start Learning
↓
Ask Question
↓
Explanation
↓
Concept Check
↓
Student Response
↓
Evaluation
↓
Feedback
↓
Retry or Complete
```

Students can skip the concept check and return to it later in the current session. Skipping is intentionally represented as a separate incomplete state rather than successful completion.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express
- TypeScript

### Database

- SQLite
- Prisma

### Architecture

```text
React UI
→ Shared API helper
→ Express routes
→ Controllers
→ Learning services
→ Database helpers
→ Prisma
→ SQLite
```

### AI behavior

The prototype uses a deterministic mocked learning and evaluation service. It provides predictable explanations and classifies responses as correct, partially correct, or incorrect without requiring an external AI provider.

## Project Structure

```text
.
├── client/                  # React + Vite frontend
│   └── src/
├── server/                  # Express + Prisma backend
│   ├── prisma/              # Prisma schema, migrations, and local SQLite database
│   └── src/
├── APPROACH.md              # Detailed product and engineering reasoning
├── README.md
├── package.json             # Workspace scripts
└── package-lock.json
```

Important backend files and directories:

- `server/src/index.ts` creates the Express app, mounts the API router, exposes the health endpoint, and registers error handling.
- `server/src/routes/` defines the REST endpoints.
- `server/src/controllers/` handles HTTP request validation, orchestration, and responses.
- `server/src/services/` contains persistence helpers, session formatting, and deterministic mock learning logic.
- `server/src/db/prisma.ts` owns the Prisma client instance.
- `server/src/middleware/` contains async and error-handling middleware.
- `server/src/validation.ts` contains shared request validation.
- `server/prisma/schema.prisma` defines the SQLite data model.
- `server/prisma/migrations/` contains the database migrations.

## API

The implemented API endpoints are:

### `POST /api/sessions`

Creates a learning session from a topic and question.

### `POST /api/questions`

Generates the mock explanation for a question and updates the session.

### `GET /api/sessions/:id`

Retrieves a persisted learning session, its interactions, and its attempt count.

### `POST /api/sessions/:id/abandon`

Marks an unfinished learning session as `ABANDONED` when the student uses the existing Skip → Finish Session flow.

### `POST /api/interactions`

Submits the student's concept-check response, evaluates it, persists the interaction, and returns feedback and the next action.

### `POST /api/feedback`

Validates and accepts feedback input, but feedback is not currently persisted because the current schema does not contain a feedback model or field.

The health endpoint is also available:

```text
GET /api/health
```

The backend validates request bodies and route IDs, handles malformed JSON and unknown routes, and returns structured API errors. The frontend presents network and backend failures as readable error states with retry actions where appropriate.

## Database

The Prisma schema contains two models:

### `LearningSession`

Stores:

- `id`
- `topic`
- `question`
- `explanation`
- `status`
- `createdAt`
- `updatedAt`

One `LearningSession` can have multiple `Interaction` records.

### `Interaction`

Stores:

- `id`
- `sessionId`
- `interactionType`
- `prompt`
- `studentResponse`
- `evaluation`
- `isCorrect`
- `attemptNumber`
- `createdAt`

The relationship is represented by `Interaction.sessionId`, which references `LearningSession.id` with cascading deletion.

The defined session statuses are `IN_PROGRESS`, `COMPLETED`, and `ABANDONED`. A successful concept check persists `COMPLETED`, an unfinished active session remains `IN_PROGRESS`, and Skip → Finish persists `ABANDONED`. The defined interaction types are `RECALL`, `MULTIPLE_CHOICE`, `SHORT_ANSWER`, and `EXPLANATION`; the current frontend uses `SHORT_ANSWER`.

The SQLite development database is local runtime state and should not be committed to Git. The schema and migrations are the source of truth for recreating it.

## Getting Started

### 1. Clone the repository

Use the repository URL for the project:

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install dependencies

Run this from the project root:

```bash
npm install
```

### 3. Configure environment variables

Create the server environment file from the included placeholder configuration:

```bash
cp server/.env.example server/.env
```

The current placeholders are:

```env
DATABASE_URL="file:./dev.db"
PORT=3001
```

The development and start scripts also default to the local SQLite database and port when these values are not explicitly set.

### 4. Generate Prisma Client and apply the database migrations

Run the workspace-aware commands from the project root:

```bash
npm run db:generate
npm run db:migrate --workspace server
```

### 5. Start the development server

Start the Vite frontend and Express backend together:

```bash
npm run dev
```

### 6. Open the application

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3001](http://localhost:3001)
- Health check: [http://localhost:3001/api/health](http://localhost:3001/api/health)

## Testing / Verification

The current implementation has been verified through builds, API checks, and manual browser flows.

Build verification:

- TypeScript build for the frontend.
- Vite production build for the frontend.
- TypeScript build for the backend.
- Prisma client generation.
- Prisma migration status.

Manual flow verification:

- Start screen and empty-input validation.
- Explanation generation and display.
- Concept-check submission with empty-answer blocking.
- Incorrect response → feedback → retry.
- Partially correct response → targeted feedback and simplify/retry path.
- Correct response → completion.
- Skip flow and separate incomplete outcome.
- Refresh and active-session restoration.
- Interaction API failure with a friendly error and retry action.
- Backend-unavailable state.
- Mobile viewport check with no horizontal overflow.
- Accessibility-oriented review of labeled controls, semantic form elements, visible focus styles, loading status, and error alerts.

There is no automated test suite currently included in the repository.

## Product Decisions

The explain-it-yourself interaction was selected because it requires active recall and gives the student a way to demonstrate understanding rather than only recognize an answer. Feedback and retry ensure that an incorrect response becomes another learning opportunity instead of a dead end.

The scope intentionally stays small so the prototype can validate one complete learning loop without being distracted by accounts, dashboards, course management, or analytics infrastructure. Deterministic mocked AI behavior keeps the experience reliable while leaving a clear service boundary for future replacement.

More detailed assumptions, user-flow reasoning, architecture decisions, edge cases, and trade-offs are documented in [APPROACH.md](./APPROACH.md).

## Trade-offs / Future Improvements

The main trade-offs are documented in [APPROACH.md](./APPROACH.md). The most important future improvements are:

- Real AI evaluation.
- Adaptive follow-up interactions for repeated difficulty.
- Persistent feedback and analytics.
- Authentication and learning history.
- More carefully selected recall, application, and practical-example interaction types.

These are future improvements, not current features.

## Documentation

`APPROACH.md` contains the detailed product reasoning, assumptions, user flow, technical architecture, trade-offs, edge cases, proposed success metrics, and future improvements.

## Assignment Scope

This prototype intentionally focuses on validating one complete active-learning loop within the assignment's 24-hour scope rather than building a large tutoring platform.