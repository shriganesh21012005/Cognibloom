Now update ONLY the root-level README.md to make the project submission-ready for the Spiral Infra / CogniBloom Product Thinking & Full Stack Challenge.

IMPORTANT:
- Documentation only.
- Do NOT modify any application source code.
- Do NOT modify Prisma schema or migrations.
- Do NOT modify APIs, dependencies, package.json files, configuration, or database files.
- Do NOT add new features.
- Base everything strictly on the CURRENT implementation.
- Do not claim anything that does not actually exist.
- Preserve useful existing information where it is accurate.
- Remove or correct outdated statements.

The README should be concise, professional, and easy for an evaluator to understand.

Structure the README approximately as follows:

# CogniBloom – Active Learning Tutor

A short 2–3 sentence description explaining that CogniBloom is a small AI-tutor learning experience designed to solve the problem of students passively reading an explanation and leaving without demonstrating understanding.

## Problem

Briefly explain:
AI can answer correctly, but an answer alone does not prove that the student understood it.

## Solution

Explain the implemented learning loop:

Student asks a question
→ Explanation
→ Explain-it-yourself concept check
→ Evaluation
→ Feedback
→ Retry / Completion

Emphasize that the product intentionally focuses on one small active-learning interaction instead of trying to become a complete tutoring platform.

## Key Features

Only list features that are actually implemented:

- Topic/question input
- AI-style explanation using deterministic mocked learning behavior
- Explain-it-yourself concept check
- Correct / partial / incorrect evaluation
- Targeted feedback
- Retry flow
- Skip flow
- Attempt tracking
- Session persistence through backend
- Local active-session restoration after refresh
- Responsive and accessible UI
- API validation and error handling

Do not describe features such as authentication, analytics dashboards, real external AI, adaptive learning engines, or multi-user history as implemented.

## User Flow

Show the flow clearly:

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

Also mention that students can skip the concept check and that skipped state is intentionally different from successful completion.

## Tech Stack

Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS

Backend:
- Node.js
- Express
- TypeScript

Database:
- SQLite
- Prisma

Architecture:
React UI → API helper → Express routes → Controllers → Services → Database helpers → Prisma → SQLite

AI:
- Deterministic mocked learning/evaluation service for the prototype.

## Project Structure

Document the important folders/files based on the actual repository:

client/
server/
server/prisma/
server/src/
APPROACH.md
README.md

Briefly explain the purpose of the important backend directories/files without inventing files.

## API

Document the ACTUAL implemented endpoints:

POST /api/sessions
POST /api/questions
GET /api/sessions/:id
POST /api/interactions
POST /api/feedback

Give one short sentence describing each.

For /api/feedback, explicitly state that the endpoint validates and accepts feedback but feedback is not currently persisted because the current schema does not contain a feedback model/field.

## Database

Briefly document:
LearningSession
Interaction

Include the important persisted fields and explain the relationship:
One LearningSession can have multiple Interaction records.

Do not claim that the SQLite development database itself should be committed to Git.

## Getting Started

Provide accurate setup instructions based on the current package/workspace configuration.

Include:

1. Clone repository
2. Install dependencies
3. Configure environment variables if required using the existing .env.example
4. Generate Prisma client / run the required database setup
5. Start development server
6. Open the application

Before writing commands, inspect the existing package.json scripts and use the commands that actually exist in this repository.

Do NOT invent commands.

## Testing / Verification

Document the validation already performed on the current implementation, including where appropriate:

- TypeScript build
- Vite production build
- Backend build
- Full learning flow
- Incorrect → retry flow
- Correct → completion flow
- Skip flow
- Refresh/session restoration
- API failure/retry behavior
- Backend unavailable state
- Mobile/responsive check
- Accessibility checks

Do not claim automated tests exist if they do not.

## Product Decisions

Keep this section short and link the detailed reasoning to APPROACH.md.

Explain:
- Why explain-it-yourself was selected
- Why retry + feedback was selected
- Why the scope intentionally stayed small
- Why mocked AI was used

## Trade-offs / Future Improvements

Summarize the most important trade-offs and point evaluators to APPROACH.md for the complete reasoning.

Mention realistic future improvements:
- Real AI evaluation
- Adaptive follow-up interactions
- Persistent feedback/analytics
- Authentication and learning history
- More carefully selected interaction types

Clearly mark these as future work, NOT current features.

## Documentation

Mention:
- APPROACH.md contains detailed product reasoning, assumptions, user flow, technical architecture, trade-offs, edge cases, success metrics, and future improvements.

## Assignment Scope

End with a concise statement that the prototype intentionally focuses on validating one complete active-learning loop within the assignment's 24-hour scope rather than building a large tutoring platform.

Finally:
- Check the final README for consistency with the current code.
- Correct the outdated statement about the learning session API not being implemented.
- Do not modify any other file.
- Report exactly what was changed.