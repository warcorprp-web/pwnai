# 🚀 PwnAI Quick Start

## Критичное готово! ✅

Базовая интеграция MSF + AI работает.

## Быстрый запуск:

```bash
cd /tmp/waveterm

# 1. Установить Go зависимости
go mod tidy

# 2. Запустить MSF RPC
msfrpcd -P password123 -a 127.0.0.1 -p 55553 &

# 3. Собрать и запустить
npm install
npm run dev
```

## Проверка:

В DevTools консоли Wave Terminal:

```javascript
// Тест RPC
const result = await RpcApi.PentestSessionsCommand({});
console.log(result);
```

## Что работает:

✅ MSF RPC клиент (Go)
✅ Claude AI клиент (Go)
✅ Pentest сервис (Go)
✅ RPC обработчики
✅ Frontend клиент (TypeScript)

## Что осталось:

- AI панель интеграция
- Русификация UI
- Брендинг PwnAI

**Время: ~1.5 часа**
