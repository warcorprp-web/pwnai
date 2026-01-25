# Отключение телеметрии

Создай файл `.env` в корне проекта:

```bash
cd pwnai
cat > .env << 'ENVEOF'
WAVETERM_TELEMETRY_ENABLED=0
ENVEOF
```

Или через UI:
Settings → Privacy → Telemetry → OFF

Перезапусти приложение.
