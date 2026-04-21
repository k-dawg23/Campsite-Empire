## 1. Configuration loader

- [x] Add a small `.env` parser for key/value configuration.
- [x] Load `.env` from project root, executable-adjacent path, or `user://.env`.
- [x] Resolve `CAMPSITE_AI_PROVIDER`, `CAMPSITE_AI_URL`, and `CAMPSITE_AI_MODEL` with OS environment variables overriding `.env` values.
- [x] Ignore invalid `.env` lines without crashing.

## 2. AI integration

- [x] Update the local AI service to use the configuration loader.
- [x] Preserve default values and template fallbacks when no provider is configured.
- [x] Add tests or self-tests for `.env` parsing and precedence.

## 3. Documentation and repo hygiene

- [x] Add `.env.example` with Ollama defaults and notes for LM Studio/llama.cpp.
- [x] Add `.env` to `.gitignore`.
- [x] Update README Local AI instructions to prefer `.env` setup.
