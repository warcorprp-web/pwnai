# План интеграции PwnAI в Wave AI

## Что нужно сделать:

### 1. Создать PwnAI AI Mode
- Файл: `pkg/wconfig/defaultconfig/defaultconfig.go`
- Добавить режим `pwnai@default` с Claude API

### 2. Добавить MSF Tools
- Файл: `pkg/aiusechat/tools.go`
- В функцию `GenerateTabStateAndTools` добавить PwnAI tools

### 3. Добавить System Prompt
- Файл: `pkg/aiusechat/usechat.go`
- В функцию `getSystemPrompt` добавить проверку на PwnAI режим

### 4. Настроить API ключ
- Через UI или конфиг файл
- Secret: `ANTHROPIC_API_KEY`

## Преимущества:

- ✅ Используем готовую инфраструктуру Wave
- ✅ Поддержка всех провайдеров (OpenAI, Claude, Google)
- ✅ Rate limiting
- ✅ Кеширование
- ✅ Безопасность API ключей

## Начинаем!
