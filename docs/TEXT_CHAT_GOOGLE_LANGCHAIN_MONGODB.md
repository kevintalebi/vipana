# Text Chat: Google AI + LangChain + MongoDB — Implementation Scenario

## Goal

- **Text type (متن) only**: Use a single model — **Google Gemini** via your Google AI Studio API key.
- **No model selector for text**: UI shows one option (e.g. "Gemini" or "چت متنی").
- **Long-term memory & history**: Use **LangChain** and **MongoDB** for conversation history and chat memory.

---

## Current State

- Text is sent to **n8n webhook** (`NEXT_PUBLIC_WEBHOOK_URL`).
- Services (including متن) come from Supabase; fallback lists include multiple text models (GPT, Claude, Gemini).
- You have:
  - **Google**: `NEXT_PUBLIC_GOOGLE_API_KEY` in `.env` and `src/app/api/google/text.ts` (standalone script, uses `GEMINI_API_KEY`).
  - **No** LangChain or MongoDB in the project yet.

---

## Recommended Architecture

```
┌─────────────────┐     POST /api/chat      ┌──────────────────────────────┐
│  Chat page      │ ──────────────────────►│  Next.js API route           │
│  (type = متن)   │  { message,             │  - Load history from MongoDB │
│                 │    conversationId?,     │  - LangChain + Gemini        │
│                 │    userId }             │  - Save new messages to     │
│                 │◄──────────────────────  │    MongoDB                   │
│                 │  { content,             │  - Optional: token deduction  │
│                 │    conversationId }     │    (existing Supabase flow)   │
└─────────────────┘                         └──────────────┬───────────────┘
                                                           │
                                                           ▼
                                                ┌──────────────────────────┐
                                                │  MongoDB                 │
                                                │  Collection: chat_       │
                                                │  message_history         │
                                                │  (sessionId = conv Id)   │
                                                └──────────────────────────┘
```

- **One API route**: e.g. `POST /api/chat` handles all text chat.
- **One model**: Gemini (e.g. `gemini-2.0-flash` or `gemini-1.5-flash`) via LangChain’s `ChatGoogleGenerativeAI`.
- **Memory**: LangChain’s `MongoDBChatMessageHistory` keyed by `conversationId` (and optionally `userId` in the sessionId for multi-tenant isolation).

---

## 1. Environment Variables

Use **server-only** keys for the API route (do not expose the Google key to the client).

| Variable            | Description                    | Example                    |
|---------------------|--------------------------------|----------------------------|
| `GOOGLE_AI_API_KEY` | Google AI Studio API key       | From .env (server only)    |
| `MONGODB_URI`       | MongoDB connection string      | `mongodb+srv://...` or local |

- Prefer `GOOGLE_AI_API_KEY` or `GEMINI_API_KEY` for the **server** route; avoid `NEXT_PUBLIC_GOOGLE_API_KEY` for this backend to keep the key off the client.
- If you already have `NEXT_PUBLIC_GOOGLE_API_KEY`, you can still use it in the API route (it’s available server-side), but renaming to a non-`NEXT_PUBLIC_` key is safer long-term.
- **Implemented:** The route falls back to `NEXT_PUBLIC_GOOGLE_API_KEY` and `NEXT_PUBLIC_MONGO_URL` if the above are not set, so it works with existing .env.

---

## 2. Dependencies

```bash
npm install langchain @langchain/core @langchain/google-genai @langchain/mongodb mongodb
```

- **langchain** / **@langchain/core**: Core and chat abstractions.
- **@langchain/google-genai**: `ChatGoogleGenerativeAI` (Gemini with Google AI Studio key).
- **@langchain/mongodb**: `MongoDBChatMessageHistory` (needs a MongoDB collection).
- **mongodb**: Official driver; used to create `MongoClient` and the collection passed to `MongoDBChatMessageHistory`.

---

## 3. Backend: API Route (e.g. `POST /api/chat`)

**Responsibilities**

1. Read `message`, optional `conversationId`, and `userId` from the body.
2. If no `conversationId`, generate one (e.g. `crypto.randomUUID()`); return it so the client can reuse it.
3. Connect to MongoDB and get or create the collection for chat history.
4. Create `MongoDBChatMessageHistory` with `sessionId = conversationId` (or `userId_conversationId` to scope by user).
5. Load history: `getMessages()`.
6. Build a LangChain chain:
   - **Model**: `ChatGoogleGenerativeAI` with `process.env.GOOGLE_AI_API_KEY` (or your chosen env name).
   - **Memory**: Use the messages from step 5 as context (e.g. pass last N messages into the prompt or use a “summary” style memory later).
7. Invoke the model with: system prompt (optional) + history + new user message.
8. Append user message and assistant message to `MongoDBChatMessageHistory` via `addUserMessage` / `addAIMessage`.
9. Return JSON: `{ content: string, conversationId: string }`; optionally include `tokensUsed` and/or call your existing token-deduction logic for متن.

**Pseudo-code (conceptual)**

```ts
// 1. Parse body
const { message, conversationId: rawId, userId } = await request.json();
const conversationId = rawId || crypto.randomUUID();

// 2. MongoDB
const client = new MongoClient(process.env.MONGODB_URI!);
const coll = client.db('vipana').collection('chat_message_history');

// 3. LangChain history
const chatHistory = new MongoDBChatMessageHistory({ collection: coll, sessionId: conversationId });
const historyMessages = await chatHistory.getMessages();

// 4. Model
const model = new ChatGoogleGenerativeAI({ model: 'gemini-2.0-flash', apiKey: process.env.GOOGLE_AI_API_KEY });

// 5. Invoke with history + new message
const fullMessages = [...historyMessages, new HumanMessage(message)];
const response = await model.invoke(fullMessages);

// 6. Persist
await chatHistory.addUserMessage(message);
await chatHistory.addAIMessage(response.content);

// 7. Return
return NextResponse.json({ content: response.content, conversationId });
```

- **Session ID strategy**: Use `conversationId` alone, or `userId + '_' + conversationId`, so each conversation has its own history and (if you add userId) users only see their own threads.
- **Token usage**: If you need to deduct tokens for متن, call your existing `consumeTokens` (or equivalent) inside this route after a successful reply, using a fixed “متن” model name (e.g. `"Gemini"`).

---

## 4. MongoDB Schema (implicit)

- **Database**: e.g. `vipana` (or your app name).
- **Collection**: e.g. `chat_message_history`.
- **Documents**: Stored by `@langchain/mongodb`; typically include a field like `sessionId` (or the one you pass) and an array (or similar) of message objects. You don’t need to create the schema by hand; the LangChain integration will write the format it expects.

---

## 5. Frontend (Chat Page) Changes

- **When type is "متن"**:
  - **Do not** use the n8n webhook for this type.
  - **Do not** show a model dropdown for متن; you can show a fixed label like "Gemini" or "چت هوشمند".
  - **Do** call the new route: `POST /api/chat` with:
    - `message`: current input
    - `conversationId`: from component state (or from sessionStorage so it survives refresh)
    - `userId`: from `useAuth()` (required for auth and optional multi-tenant sessionId)
  - On first message in a “thread”, omit `conversationId`; the API returns one — store it in state and (optionally) in sessionStorage.
  - Append the returned `content` as the assistant message in the UI; keep existing message list structure so image/video flows are unchanged.

- **Services data**:
  - For type "متن", you can either:
    - Keep a single fixed option in code (e.g. only "Gemini") and ignore Supabase for متن models, or
    - Filter Supabase services so that for "متن" you only show one model (e.g. the one that maps to this API).

- **Token deduction**:
  - If you want to charge for text: either the new `/api/chat` route calls your existing token-consumption logic with a fixed model name, or the frontend calls an existing “deduct tokens” endpoint after a successful reply. Prefer doing it in the API route so the client cannot skip it.

---

## 6. Implementation Order

1. **Env**: Add `GOOGLE_AI_API_KEY` (or reuse existing) and `MONGODB_URI` in `.env`.
2. **Packages**: Install `langchain`, `@langchain/core`, `@langchain/google-genai`, `@langchain/mongodb`, `mongodb`.
3. **API route**: Implement `src/app/api/chat/route.ts` (or `route.js`) with the flow above; use a single Gemini model and MongoDBChatMessageHistory.
4. **Chat page**:
   - For `selectedType === 'متن'`: call `/api/chat` instead of the webhook; manage `conversationId` in state/sessionStorage; hide model selector for متن.
   - Keep image/video and webhook logic unchanged.
5. **Optional**: List conversations per user (e.g. new endpoint that queries MongoDB by `userId` and returns list of `conversationId` + last message/time); add a “New chat” button that clears `conversationId` so the next message starts a new thread.

---

## 7. Optional Enhancements

- **Streaming**: Use `model.stream()` and return a streaming response (e.g. `ReadableStream`) so the UI can show tokens as they arrive.
- **System prompt**: Pass a fixed system prompt (e.g. “You are a helpful assistant for Vipana. Respond in Persian when the user writes in Persian.”) as the first message or via a wrapper.
- **Summary memory**: For very long threads, periodically summarize older messages and prepend the summary to the context instead of sending all messages (e.g. with a separate summarizer chain or a “buffer + summary” pattern).
- **Conversation list**: Store metadata (e.g. `userId`, `conversationId`, `title`, `updatedAt`) in a separate `conversations` collection and load it on the chat page for a sidebar of past chats.

---

## 8. Security and Validation

- Validate `userId` from your auth (e.g. Supabase session) and ensure the API route only uses the authenticated user’s id (don’t trust `userId` from the body alone; take it from the session/token).
- Rate-limit the chat endpoint to avoid abuse.
- Keep `GOOGLE_AI_API_KEY` and `MONGODB_URI` server-only (no `NEXT_PUBLIC_`).

---

## Summary

| Item              | Choice                                              |
|-------------------|-----------------------------------------------------|
| Text model        | Single: Google Gemini (AI Studio key)              |
| Stack             | LangChain + @langchain/google-genai + @langchain/mongodb |
| Storage           | MongoDB (conversation history per conversationId)  |
| API               | New `POST /api/chat`                                |
| Frontend (متن)    | Call `/api/chat`, keep conversationId, no model UI  |
| Env               | `GOOGLE_AI_API_KEY`, `MONGODB_URI` (server-only)    |

This scenario gives you a single text model (Google), long-term conversation history in MongoDB, and a clear path to implement it step by step in your existing chat page and auth flow.
