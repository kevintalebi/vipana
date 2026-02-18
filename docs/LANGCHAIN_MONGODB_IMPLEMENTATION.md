# LangChain + MongoDB Chat Implementation Scenario

Single model (Google Gemini via LangChain) with conversation history and long-term memory in MongoDB.

---

## 1. Current State vs Target

| Current | Target |
|--------|--------|
| Multiple types (متن / عکس / ویدیو), n8n webhook, KIE for media | **Text chat only** via one model |
| No conversation memory | **MongoDB**: full history + optional summarized memory |
| Model selection in UI | **Single model**: Google Gemini (LangChain) |
| Token logic in frontend/Supabase | Keep or move to backend; chat uses LangChain + MongoDB only |

---

## 2. Environment Variables

Use a **server-only** key for Gemini (do not expose in the browser):

- In `.env` (and `.env.local`):
  - `GOOGLE_API_KEY=...` — same value as your Google AI Studio key (use only on server).
- Optional: keep `NEXT_PUBLIC_GOOGLE_API_KEY` for any client-side feature later, but **do not** use it for LangChain on the server.
- You already have:
  - `NEXT_PUBLIC_MONGO_URL` — use this for MongoDB (or add server-only `MONGODB_URI` and use that in API routes).

---

## 3. Dependencies

```bash
npm install langchain @langchain/google-genai @langchain/core mongodb
```

- `langchain` — core chains and memory interfaces.
- `@langchain/google-genai` — ChatGoogleGenerativeAI (Gemini).
- `@langchain/core` — message types (HumanMessage, AIMessage).
- `mongodb` — official driver for MongoDB (LangChain can use it for message history).

---

## 4. MongoDB Data Model

### 4.1 Collections

**`conversations`** (one per chat thread per user)

```ts
{
  _id: ObjectId,
  userId: string,           // Supabase user id
  title: string,             // optional, e.g. first message snippet
  createdAt: Date,
  updatedAt: Date
}
```

**`messages`** (ordered messages in a conversation)

```ts
{
  _id: ObjectId,
  conversationId: ObjectId,  // ref to conversations._id
  role: 'user' | 'assistant' | 'system',
  content: string,
  createdAt: Date
}
```

**Optional – `memory` (long-term facts per user)**

```ts
{
  _id: ObjectId,
  userId: string,
  summary: string,            // e.g. condensed facts about the user
  updatedAt: Date
}
```

Use `conversations` + `messages` for **conversation history**. Use `memory` only if you want a separate “user summary” that you inject as system context (e.g. “The user prefers X, works on Y”).

---

## 5. Implementation Flow (Scenario)

### 5.1 Backend: MongoDB Helpers

- **`src/lib/mongodb.ts`**
  - Connect to MongoDB using `process.env.NEXT_PUBLIC_MONGO_URL` or `MONGODB_URI`.
  - Export `getDb()` and reuse the client (e.g. singleton or cached in dev).

- **`src/lib/repositories/conversations.ts`** (or similar)
  - `createConversation(userId, title?)` → insert into `conversations`, return `_id`.
  - `getConversation(conversationId)` → return conversation (and optionally last N messages).
  - `listConversations(userId)` → for sidebar/list of chats.

- **`src/lib/repositories/messages.ts`**
  - `getMessages(conversationId, limit?)` → last N messages, ordered by `createdAt`.
  - `addMessage(conversationId, role, content)` → append one message.

### 5.2 Backend: LangChain + Gemini

- **`src/lib/llm.ts`** (or `src/lib/chat.ts`)
  - Create **one** model instance:
    - `ChatGoogleGenerativeAI` from `@langchain/google-genai` with `apiKey: process.env.GOOGLE_API_KEY`, model name e.g. `gemini-1.5-flash` or `gemini-1.5-pro`.
  - Export a function that:
    - Accepts an array of `{ role: 'user'|'assistant'|'system', content: string }` (from MongoDB).
    - Converts to LangChain message types (`HumanMessage`, `AIMessage`, `SystemMessage`).
    - Calls `model.invoke(messages)` (or a simple chain).
    - Returns the assistant’s **text** reply.

No model selection in code — single model only.

### 5.3 Backend: Chat API Route

- **`src/app/api/chat/route.ts`** (POST)

  **Request body:**

  - `message: string` — current user message.
  - `conversationId?: string` — optional; if missing, create a new conversation.

  **Logic:**

  1. **Auth:** Resolve user (e.g. from Supabase auth token or session). Reject if not authenticated.
  2. **Conversation:**
     - If `conversationId` provided: load conversation, ensure it belongs to the user.
     - If not: create new conversation (e.g. title = first 50 chars of `message`), get new `conversationId`.
  3. **History:** Load last K messages (e.g. 20) for this `conversationId` from `messages`.
  4. **LangChain:**
     - Build message array: optional system message (e.g. “You are a helpful assistant”) + history + new user message.
     - Call your LangChain Gemini function with this array.
     - Get assistant text response.
  5. **Save:**
     - Insert user message into `messages`.
     - Insert assistant message into `messages`.
     - Optionally update `conversations.updatedAt` (and `title` if it’s the first message).
  6. **Response:** Return `{ conversationId, reply: string }` (and optionally new `messages` or `title`).

**Long-term memory (optional):**

- Before step 4, load from `memory` collection by `userId` and prepend a system message like “Relevant context about the user: …”.
- After step 5, you can run a separate job or a simple summarizer that updates `memory.summary` from the last N conversations (e.g. with another LLM call). That keeps “long-term memory” separate from raw history.

### 5.4 Frontend: Chat Page

- **Remove:** Model selector, any n8n/KIE-specific UI for this flow.
- **State:**
  - `conversationId: string | null` — current thread (null = new chat).
  - `messages` — list of `{ id, text, isUser, timestamp }` derived from API or loaded on mount.
- **Send message:**
  - POST to `/api/chat` with `{ message: inputValue, conversationId }`.
  - On success: append user message to UI, append assistant `reply` as bot message; set `conversationId` from response if it was a new conversation.
- **New chat:** Set `conversationId = null` and clear local `messages` (or load from a “conversations list” if you add it later).

No “model” or “type” in the request — backend uses the single Gemini model only.

---

## 6. Order of Implementation

1. **Env:** Add `GOOGLE_API_KEY` (server-only), confirm MongoDB URL.
2. **Packages:** Install LangChain + Google + MongoDB.
3. **MongoDB:** Implement `mongodb.ts` and repositories for `conversations` and `messages`.
4. **LLM:** Implement `src/lib/llm.ts` with ChatGoogleGenerativeAI and one `invoke(messages)` function.
5. **API:** Implement `POST /api/chat` with auth, conversation create/load, history load, LangChain call, save messages, return reply.
6. **Frontend:** Simplify chat page to single model, call `/api/chat`, use `conversationId` and returned `reply`.
7. **Optional:** Add “New conversation” and “List conversations” using `conversations` collection.
8. **Optional:** Add `memory` collection and inject user summary into system message for long-term context.

---

## 7. Security and Performance

- **Auth:** Always validate that `conversationId` belongs to the authenticated user before loading/updating.
- **API key:** Use `GOOGLE_API_KEY` only in server code (API routes, `src/lib/*`).
- **History size:** Limit messages per request (e.g. last 20) to avoid huge context and token limits.
- **MongoDB:** Prefer indexes on `conversations.userId`, `messages.conversationId`, and `messages.createdAt`.

This scenario gives you a single Google model via LangChain and MongoDB for conversation history and optional long-term memory, without supporting other models or the previous n8n/KIE text path.
