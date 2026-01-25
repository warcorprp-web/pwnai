# PwnAI - AI-Powered Penetration Testing Terminal

**PwnAI** - это мощный терминал для пентестинга с интеграцией искусственного интеллекта, основанный на Wave Terminal и Metasploit Framework.

## 🎯 Возможности

- ✅ **AI Ассистент** - Claude Sonnet 4.5 с пониманием контекста пентестинга
- ✅ **Metasploit интеграция** - полный доступ к MSF через RPC API
- ✅ **Блоки команд** - изолированное выполнение с историей
- ✅ **Сканирование** - nmap через MSF с разными режимами
- ✅ **Эксплуатация** - автоматический подбор payload и опций
- ✅ **Управление сессиями** - meterpreter и shell команды
- ✅ **Поиск эксплойтов** - по ключевым словам и CVE
- ✅ **Русский интерфейс** - полная локализация

## 🚀 Быстрый старт

### Требования

- Go 1.21+
- Node.js 18+
- Metasploit Framework
- Linux/macOS/Windows

### Установка

```bash
# Клонируем репозиторий
git clone https://github.com/yourusername/pwnai
cd pwnai

# Устанавливаем зависимости
npm install

# Собираем проект
npm run build:prod

# Запускаем
npm start
```

### Настройка Metasploit

```bash
# Запускаем MSF RPC сервер
msfrpcd -P password123 -a 127.0.0.1 -p 55553

# Или PwnAI запустит его автоматически
```

## 📖 Использование

### AI Команды

```
Просканируй 192.168.1.100

Найди эксплойты для SMB

Эксплуатируй MS17-010 на 192.168.1.100

Покажи активные сессии

Выполни sysinfo в сессии 1

Сделай скриншот с сессии 1
```

### Прямые команды

```bash
$ scan 192.168.1.100
$ exploit ms17-010 192.168.1.100
$ sessions
$ use 1
$ sysinfo
```

## 🛠️ Архитектура

```
┌─────────────────────────────────────┐
│ Frontend (React + TypeScript)       │
│ - UI, терминал, AI панель           │
└──────────────┬──────────────────────┘
               │ WebSocket RPC
┌──────────────┴──────────────────────┐
│ Backend (Go)                        │
│ - PTY терминалы                     │
│ - MSF RPC клиент                    │
│ - Claude AI клиент                  │
│ - Pentest сервис                    │
└──────────────┬──────────────────────┘
               │ MSF RPC
┌──────────────┴──────────────────────┐
│ Metasploit Framework                │
└─────────────────────────────────────┘
```

## 📁 Структура проекта

```
pwnai/
├── frontend/           # React UI
│   ├── app/           # Компоненты приложения
│   └── types/         # TypeScript типы
├── pkg/               # Go пакеты
│   ├── msfclient/     # MSF RPC клиент
│   ├── aiclient/      # Claude API клиент
│   ├── pentest/       # Pentest сервис
│   └── wshrpc/        # WebSocket RPC
├── cmd/               # Исполняемые файлы
└── build/             # Сборка
```

## 🔧 Разработка

### Запуск в режиме разработки

```bash
npm run dev
```

### Сборка

```bash
# Development
npm run build:dev

# Production
npm run build:prod
```

### Тестирование

```bash
npm test
```

## 🎨 Кастомизация

### Темы

Темы настраиваются в `frontend/app/theme.scss`

### AI Промпты

Промпты для AI находятся в `aiprompts/`

### MSF Настройки

Настройки MSF в `pkg/pentest/pentest.go`

## 📝 Лицензия

Apache 2.0 - см. [LICENSE](LICENSE)

## 🤝 Вклад

Приветствуются pull requests! Для больших изменений сначала откройте issue.

## ⚠️ Предупреждение

Используйте только в легальных целях и с разрешением владельца системы. Авторы не несут ответственности за неправомерное использование.

## 📧 Контакты

- GitHub: https://github.com/yourusername/pwnai
- Issues: https://github.com/yourusername/pwnai/issues

## 🙏 Благодарности

- [Wave Terminal](https://github.com/wavetermdev/waveterm) - за отличный терминал
- [Metasploit Framework](https://www.metasploit.com/) - за фреймворк пентестинга
- [Anthropic](https://www.anthropic.com/) - за Claude AI

---

**PwnAI** - Пентестинг с искусственным интеллектом 🚀
