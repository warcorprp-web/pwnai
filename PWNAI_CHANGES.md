# Изменения в Wave Terminal для PwnAI

## Что сделано:

### ✅ 1. Создан MSF RPC клиент (Go)
- `pkg/msfclient/msfclient.go` - полноценный клиент для Metasploit RPC
- Аутентификация, вызовы методов, обработка ошибок
- Русские комментарии и сообщения об ошибках

### ✅ 2. Создан Claude AI клиент (Go)
- `pkg/aiclient/claude.go` - клиент для Claude API
- Поддержка tools/function calling
- Извлечение tool_use и текстовых ответов

### ✅ 3. Создан Pentest сервис (Go)
- `pkg/pentest/pentest.go` - основной сервис пентестинга
- Методы: ScanTarget, ExploitTarget, ListSessions, RunSessionCommand
- Интеграция MSF + AI

### ✅ 4. Определены AI инструменты
- `pkg/pentest/tools.go` - 6 инструментов для AI:
  - scan_target - сканирование
  - search_exploits - поиск эксплойтов
  - exploit_target - эксплуатация
  - list_sessions - список сессий
  - run_session_command - команды в сессии
  - msf_rpc_call - прямой вызов MSF RPC

### ✅ 5. Русификация
- `README.ru.md` - русская документация
- Русские комментарии в коде
- Русские сообщения об ошибках

## Что нужно сделать дальше:

### 📝 Шаг 1: Интеграция с Wave RPC

Создать файл `pkg/wshrpc/wshserver/pentesthandler.go`:

```go
package wshserver

import (
    "context"
    "github.com/wavetermdev/waveterm/pkg/pentest"
    "github.com/wavetermdev/waveterm/pkg/wshrpc"
)

var pentestService *pentest.PentestService

func InitPentestService() error {
    var err error
    pentestService, err = pentest.NewPentestService("127.0.0.1", 55553, "879621")
    return err
}

// Регистрируем RPC команды
func RegisterPentestCommands() {
    wshrpc.RegisterCommand("pentest:scan", ScanTargetCommand)
    wshrpc.RegisterCommand("pentest:exploit", ExploitTargetCommand)
    wshrpc.RegisterCommand("pentest:sessions", ListSessionsCommand)
    wshrpc.RegisterCommand("pentest:command", RunSessionCommandCommand)
}
```

### 📝 Шаг 2: Добавить инициализацию в main

В `cmd/server/main-server.go` добавить:

```go
import "github.com/wavetermdev/waveterm/pkg/wshrpc/wshserver"

func main() {
    // ... существующий код ...
    
    // Инициализация pentest сервиса
    if err := wshserver.InitPentestService(); err != nil {
        log.Printf("⚠️  Pentest service initialization failed: %v", err)
    } else {
        log.Printf("✅ Pentest service initialized")
        wshserver.RegisterPentestCommands()
    }
    
    // ... остальной код ...
}
```

### 📝 Шаг 3: Обновить frontend

В `frontend/app/aipanel/aipanel.tsx` заменить AI клиент на наш:

```typescript
// Заменить Wave AI на наш pentest AI
const tools = [
  // Импортировать из backend
];

// Использовать наш RPC для вызова инструментов
```

### 📝 Шаг 4: Русификация UI

Создать файл `frontend/app/i18n/ru.ts` с переводами:

```typescript
export const ru = {
  "ai.welcome": "Добро пожаловать в PwnAI",
  "ai.scan": "Сканирование",
  "ai.exploit": "Эксплуатация",
  // ... и т.д.
};
```

### 📝 Шаг 5: Обновить package.json

```json
{
  "name": "pwnai",
  "productName": "PwnAI",
  "description": "AI-Powered Penetration Testing Terminal",
  "version": "1.0.0"
}
```

## Команды для сборки:

```bash
# Установка зависимостей
npm install

# Сборка Go backend
go build -o dist/pwnai cmd/server/main-server.go

# Сборка frontend
npm run build:prod

# Запуск
npm start
```

## Тестирование:

```bash
# 1. Запустить MSF RPC
msfrpcd -P password123 -a 127.0.0.1 -p 55553

# 2. Запустить PwnAI
npm start

# 3. В терминале попробовать:
Просканируй 127.0.0.1
```

## Следующие фичи:

- [ ] Автоматический запуск MSF RPC
- [ ] Визуализация результатов сканирования
- [ ] История команд и сессий
- [ ] Экспорт отчётов
- [ ] Интеграция с другими инструментами (nmap, burp)
- [ ] Плагины и расширения
