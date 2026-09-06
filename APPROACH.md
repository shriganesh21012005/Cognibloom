# Approach

## 1. Problem Understanding

An AI tutor can provide a technically correct explanation, but a student may read it, feel that it makes sense, and leave without actually understanding or remembering the concept. This is not true of every student or every learning moment, but it is the key failure mode CogniBloom is designed to address.

The product problem is the missing step between “AI explains” and “student leaves”: the student needs an opportunity to actively demonstrate understanding.

Receiving information and demonstrating understanding are different activities. Reading an explanation mainly tests recognition. Explaining the idea in the student's own words requires recall and reconstruction, which gives both the student and the system better evidence of what was understood.

## 2. User

The primary user is a student who uses an AI tutor to understand a concept or answer a learning question.

The student's goals are to:

- Understand the concept.
- Check whether they actually understood it.
- Continue learning without unnecessary friction.

The likely frustration is that an explanation can feel clear while it is being read, while the student may still be unable to explain the idea independently. CogniBloom addresses that gap with one short concept-check interaction rather than requiring the student to navigate a larger course or dashboard.

## 3. Assumptions

The solution is based on these assumptions:

- The student has already asked a learning question.
- The AI explanation is the starting point for learning, not the end point.
- A short active-recall interaction is more useful than immediately showing another long explanation.
- Students need feedback when their understanding is incomplete.
- A low-friction interaction is more suitable for a small learning session than a large dashboard or course system.
- AI can be mocked for the prototype because the assignment evaluates the learning interaction and engineering design rather than model quality.

## 4. Proposed Solution

CogniBloom – Active Learning Tutor turns an explanation into a small learning loop:

```text
Student question
→ AI explanation
→ “Let's check your understanding”
→ Student explains the concept in their own words
→ System evaluates the response
→ Targeted feedback
→ Retry if needed
→ Completion
```

The central interaction is “Explain it yourself.” It was selected because it:

- Requires active recall.
- Reveals whether the student can reconstruct the concept rather than only recognize it.
- Creates a natural opportunity for feedback.
- Is simple enough to complete in one short session.
- Directly addresses passive consumption after an explanation.

The prototype uses deterministic mocked explanation and evaluation logic. This makes the complete experience reliable and testable while preserving an API boundary where a future learning service can replace the mock behavior.

## 5. User Flow

The implemented flow is:

1. **Start Learning**
   - The student enters a topic and question.
   - Empty input is validated before the session is submitted.
   - The backend creates a persisted learning session.

2. **Explanation**
   - The backend generates a mock explanation and the frontend displays it.
   - The student is explicitly encouraged to check their understanding rather than simply leave.

3. **Concept Check**
   - The student is asked to explain the concept in their own words.
   - The student can submit an answer or skip the check.

4. **Evaluation and Feedback**
   - The backend evaluates the response.
   - The result can be correct, partially correct, or incorrect.
   - The frontend displays feedback and the backend-provided next action.

5. **Retry**
   - Incorrect and partially correct responses remain retryable.
   - Attempt numbers are tracked in the interaction records and frontend state.

6. **Completion**
   - A correct response can lead to the completed state.
   - Skipping leads to a separate incomplete path and is never presented as successful learning.

7. **Restoration**
   - The active session ID is stored in local storage under `cognibloom.sessionId`.
   - On refresh, the frontend retrieves the session and restores the explanation, concept-check, or completed state.

## 6. Product Decisions

### Chosen: Explain-it-yourself concept check

This directly addresses the problem with a small cognitive effort. It produces meaningful evidence of understanding and is simple enough to complete and evaluate within one session.

### Feedback and retry

A wrong answer should not be a dead end. Feedback turns an unsuccessful attempt into another learning opportunity, and retry supports learning rather than only scoring the student. The current prototype distinguishes between incorrect and partially correct responses and uses `RETRY` or `SIMPLIFY` next actions.

### Low-friction single-session experience

The assignment asks for a focused learning interaction. A dashboard, account system, course catalogue, streak system, or similar feature would add scope without improving the central learning loop.

### Local session restoration

Students may refresh or temporarily leave. Restoring the active session reduces frustration and supports continuity without requiring authentication in this prototype.

### Explicit incomplete skip state

Skipping is available because students may not be ready to answer, but it is not treated as proof of understanding. The UI clearly distinguishes a skipped session from a completed one.

## 7. Rejected / Deferred Alternatives

### Multiple-choice quiz

This was not chosen as the primary interaction because recognizing the correct option can be easier than generating an explanation independently.

### Large quiz system

This is deferred because it increases scope without directly improving the core learning interaction.

### Confidence rating as the main interaction

Confidence could be useful metadata, but it does not itself demonstrate understanding, so it was not used as the primary check.

### Full adaptive difficulty engine

This is deferred because the prototype first needs to prove the core interaction loop. The current mock evaluator provides deterministic categories and next actions, but it is not a sophisticated adaptive engine.

### Authentication and student dashboard

These are deferred because this is a single-session learning prototype and authentication does not solve the central learning problem.

### Real external AI integration

This is deferred so the prototype remains deterministic, testable, and reliable. The service boundary allows a future AI provider to replace the mock implementation without changing the controller contract.

## 8. Technical Architecture

The current architecture is:

- **Frontend:** React, TypeScript, Vite, and Tailwind CSS.
- **Backend:** Node.js, Express, and TypeScript.
- **Database:** SQLite with Prisma.
- **Communication:** REST APIs.

The request and persistence path is:

```text
React UI
↓
Shared API helper
↓
Express routes
↓
Controllers
↓
Learning services
↓
Database helpers
↓
Prisma
↓
SQLite
```

Responsibilities are separated as follows:

- Routes define the available endpoints.
- Controllers handle HTTP-level concerns, request parsing, and response shaping.
- Services contain learning and persistence operations.
- The mock learning service contains deterministic explanation and evaluation behavior.
- Database helpers isolate Prisma access from controllers.
- Prisma provides typed database access to SQLite.

The frontend keeps the current stage, answer, attempt number, feedback, and transient errors in React state. The backend persists sessions and interactions so the learning activity is not represented only in browser state.

## 9. Backend / API Design

The implemented endpoints are:

### `POST /api/sessions`

Creates a learning session from a topic and question. The initial explanation is empty until the question endpoint is called.

### `POST /api/questions`

Accepts a session ID and question, generates the deterministic mock explanation, and updates the session.

### `GET /api/sessions/:id`

Retrieves a persisted session together with its interactions and derived attempt count.

### `POST /api/sessions/:id/abandon`

Marks an unfinished session as `ABANDONED` when the student uses the existing Skip → Finish Session flow.

### `POST /api/interactions`

Accepts the student's concept-check response, evaluates it through the mock learning service, persists the interaction, updates the session status, and returns the evaluation, feedback, next action, attempt number, and session status.

### `POST /api/feedback`

Accepts and validates feedback input. It currently returns `accepted: false` and `persisted: false` because the current schema does not contain a feedback model or field. No feedback persistence is claimed.

The backend includes:

- Request-body validation.
- Required string validation.
- Positive integer validation.
- Interaction-type validation.
- Optional rating and comment validation for the feedback endpoint.
- Structured API errors.
- Malformed JSON handling.
- Unknown-route handling.
- Prisma not-found handling.
- A final internal-error handler.

The frontend converts network failures and unexpected responses into readable error states, including a clear backend-unavailable message and retry controls.

## 10. Database Design

### `LearningSession`

Stores:

- `id`
- `topic`
- `question`
- `explanation`
- `status`
- `createdAt`
- `updatedAt`
- Related `interactions`

The defined session status values are:

- `IN_PROGRESS`
- `COMPLETED`
- `ABANDONED`

The current frontend completion flow persists `COMPLETED` after a successful concept check and persists `ABANDONED` when the student uses Skip → Finish Session. An unfinished active session remains `IN_PROGRESS`.

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

The interaction type enum currently defines:

- `RECALL`
- `MULTIPLE_CHOICE`
- `SHORT_ANSWER`
- `EXPLANATION`

The current frontend submits `SHORT_ANSWER` interactions. The other types are represented in the schema but are not separate UI flows in this prototype.

Persistence matters because the learning interaction should not exist only in React state. The backend has a durable representation of the learning session and the student's responses, and a session can be retrieved after a refresh.

## 11. Edge Cases Considered

The current implementation handles:

- **Empty question or input:** frontend validation prevents submission, and backend validation also rejects empty values.
- **Incorrect answer:** the backend returns incorrect feedback with a retry action.
- **Partially correct answer:** the backend returns targeted feedback and a simplify/retry path.
- **Skipped concept check:** the frontend shows a separate skipped state and does not present skipping as successful learning.
- **Interaction API failure:** the frontend shows a friendly error and changes the submit action to an explicit retry action.
- **Backend unavailable:** the start screen shows a clear connection state and API errors are surfaced to the user.
- **Page refresh:** the active session ID is stored locally and the session can be restored.
- **Student leaves midway:** local restoration helps preserve the active session.
- **Repeated difficulty:** retry remains available and the feedback can guide another attempt. This is not a sophisticated adaptive escalation system.
- **AI unavailable:** the prototype uses deterministic mocked behavior rather than depending on an external AI service.

## 12. Trade-offs

### Mocked AI instead of real AI

The trade-off is less realism, but deterministic behavior makes the prototype reliable and keeps the focus on the product interaction.

### One core interaction type

There is less variety, but the implementation gives a clearer test of the central active-learning hypothesis. The Prisma schema anticipates other interaction types, while the current UI focuses on short-answer explanation.

### No authentication

There is no multi-user account system, but the prototype avoids complexity that does not solve the central learning problem.

### SQLite

SQLite is simple and fast for a small prototype. A hosted production database would be more appropriate for scale and multi-user operation, but would introduce operational complexity that is unnecessary here.

### No analytics dashboard

Useful product metrics can be defined, but they are not currently instrumented because the assignment does not require analytics implementation.

### Feedback endpoint not persisted

The feedback endpoint validates and accepts the request shape, but the current data model does not persist feedback. This keeps the schema focused on the learning session and interaction loop.

### No next-question API

The correct-feedback view includes “Continue Learning,” but the current implementation returns to the start screen because there is no next-question API. Adding a larger question sequence was intentionally kept outside the prototype scope.

## 13. Success Metrics

These are proposed product metrics for a real product, not metrics currently instrumented in the prototype:

1. **Concept-check completion rate**  
   The percentage of students who attempt the active-learning step after receiving an explanation.

2. **Retry-to-correct rate**  
   The percentage of incorrect or partially correct attempts that become correct after feedback.

3. **Drop-off after explanation**  
   The percentage of sessions that end before the student attempts the concept check.

4. **Session completion rate**  
   The percentage of started sessions reaching a meaningful completion state.

5. **Repeat-question rate**  
   Whether students need to ask the same question again, which may indicate weak understanding.

The current project stores sessions and interactions, but it does not implement an analytics pipeline or dashboard for these metrics.

## 14. What I Would Improve With More Time

### 1. Real AI evaluation

Replace the deterministic evaluator with an AI-assisted evaluator that can assess explanations semantically while preserving validation and safety constraints.

### 2. Adaptive follow-up interactions

If a student repeatedly struggles, offer a simpler example, a guided question, or a multiple-choice scaffold instead of only repeating the same free-form prompt.

### 3. Persistent feedback and analytics

Add a feedback model and instrument the learning funnel so product decisions can be based on concept-check completion, retry outcomes, and drop-off.

### 4. Better session continuity

Support authenticated users and persistent learning history once the single-session interaction has been validated.

### 5. More interaction types

Add carefully selected recall, application, and practical-example questions while keeping the core flow simple.

The prototype intentionally focuses on proving one learning loop rather than building a large tutoring platform.