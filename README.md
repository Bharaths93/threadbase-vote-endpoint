# Threadbase Vote Endpoint

Implementation of the atomic `POST /posts/:id/vote` endpoint on Threadbase using Prisma Client, PostgreSQL, Express, and TypeScript.

## Features

- **Atomic Increment**: Score increment uses `{ score: { increment: 1 } }` inside a single Prisma `$transaction` rather than a vulnerable read-then-write pattern.
- **Double-Vote Prevention**: `Vote` join table enforces uniqueness via composite constraint `@@unique([userId, postId])`.
- **Robust Error Mapping**:
  - `isNaN(postId)` $\rightarrow$ `400 Bad Request` ("Invalid post ID")
  - `P2002` (Prisma unique constraint failed) $\rightarrow$ `409 Conflict` ("Already voted")
  - `P2025` (Prisma record not found) $\rightarrow$ `404 Not Found` ("Post not found")
  - Success $\rightarrow$ `201 Created` with updated score

## Database Schema

```prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String
  votes Vote[]
}

model Post {
  id    Int    @id @default(autoincrement())
  title String
  body  String
  score Int    @default(0)
  votes Vote[]
}

model Vote {
  id     Int  @id @default(autoincrement())
  userId Int
  postId Int
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
}
```

## Setup & Running

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Create a `.env` file from `.env.example`:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/threadbase?schema=public"
   PORT=3000
   ```

3. **Run database migration & generate client**:
   ```bash
   npx prisma migrate dev --name add-votes
   npx prisma generate
   ```

4. **Seed database**:
   ```bash
   npm run seed
   ```

5. **Start server**:
   ```bash
   npm start
   ```

## Test Results

![Thunder Client Test Results](docs/thunder-client-results.svg)

| Request | Expected Status | Result | Description |
| :--- | :--- | :--- | :--- |
| `POST /posts/1/vote` (first time) | `201 Created` | `{"score": 1}` | First vote recorded, score bumped atomically |
| `POST /posts/1/vote` (same user) | `409 Conflict` | `{"error": "Already voted"}` | P2002 duplicate vote prevented |
| `POST /posts/999999/vote` | `404 Not Found` | `{"error": "Post not found"}` | P2025 non-existent post handled |
| `POST /posts/abc/vote` | `400 Bad Request` | `{"error": "Invalid post ID"}` | Input validation guard triggered before DB call |
