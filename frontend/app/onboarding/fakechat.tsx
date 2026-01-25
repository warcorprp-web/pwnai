// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { WaveStreamdown } from "@/app/element/streamdown";
import { memo, useEffect, useRef, useState } from "react";

interface ChatConfig {
    userPrompt: string;
    toolName: string;
    toolDescription: string;
    markdownResponse: string;
}

const chatConfigs: ChatConfig[] = [
    {
        userPrompt: "Проверь ~/iskra-terminal и опиши проект — что он делает и как организован.",
        toolName: "read_dir",
        toolDescription: 'чтение директории "~/iskra-terminal"',
        markdownResponse: `Вот краткий обзор структуры этого репозитория (Искра Терминал):

## Что это
- Electron + React фронтенд с Go бэкендом. Предоставляет терминал с GUI виджетами, превью, веб-браузером и AI. (README.md)
- Лицензия Apache-2.0. (LICENSE)

## Архитектура
- **Electron main process:** \`emain/*.ts\` настраивает окна, меню, preload скрипты, обновления и связывается с Go бэкендом через локальный RPC. (\`emain/\`)
- **Renderer UI:** React/TS собирается с Vite, Tailwind. (\`frontend/\`, \`index.html\`)
- **Go backend:** запускает сервисы, web и websocket слушатели, телеметрию, конфиг watcher, локальный RPC, filestore и SQLite-backed object store. (\`cmd/server/main-server.go\`, \`pkg/*\`)
- **CLI helper ("ish"):** собирается для разных OS/arch; используется для shell интеграции и удалённых операций. (\`cmd/wsh/\`)

## Ключевые директории
- **cmd/:** точки входа
  - \`server/\`: главный сервер
  - \`wsh/\`: shell helper (ish)

- **pkg/:** backend пакеты
  - \`wcore/\`: координация запуска, начальные данные, создание окон/workspace
  - \`web/\`: HTTP+WS серверы
  - \`waveai/\`: AI бэкенды (Anthropic, Alibaba)
  - \`wshrpc\`, \`wshutil\`: локальный/удалённый RPC
  - \`wstore/\`: постоянное хранилище (SQLite)
  - \`filestore/\`: локальный кэш файлов`,
    },
    {
        userPrompt: "можешь проанализировать вывод логов в моём терминале?",
        toolName: "term_get_scrollback",
        toolDescription: "чтение вывода терминала из виджета",
        markdownResponse: `Вот что показывают ваши логи:

- Нормальный запуск/инициализация в 18:06:51 (router/register, DBGetAllObjsByType).
- Много событий FocusWindow — обычная активность UI.
- 18:08:28.558 WebSocket ReadPump error: close 1001 (going away) — обычно перезагрузка вкладки/приложения, сон или кратковременный сбой сети.
- 18:08:29 повторная инициализация + новое WebSocket соединение — успешное автоподключение.
- SetMetaCommand и периодические сбросы filestore — нормально; ошибок нет.
- Никаких паник/фатальных ошибок; только временное отключение.

Если это отключение было неожиданным, проверьте перезагрузку вкладки/сон в 18:08:28 и следите за повторениями.

Нужна более глубокая диагностика? Запустите эти команды:

\`\`\`bash
# 1) Сканирование последних логов на проблемы
grep -Ei 'error|panic|fatal|websocket|1006|1011' \\
  "$HOME/.config/iskra-terminal/iskra.log" | tail -n 200

# 2) Проверка окна отключения
awk '($0 ~ /2025-10-10 18:08:2[0-9]/){print}' \\
  "$HOME/.config/iskra-terminal/iskra.log"

# 3) Отслеживание в реальном времени
tail -f "$HOME/.config/iskra-terminal/iskra.log" \\
  | grep -Ei 'error|panic|fatal|websocket|close'
\`\`\`

Нужно посмотреть больший срез (например, последние 1000 строк) или другой временной диапазон?`,
    },
];

const AIThinking = memo(() => (
    <div className="flex items-center gap-2">
        <div className="animate-pulse flex items-center">
            <i className="fa fa-circle text-[10px]"></i>
            <i className="fa fa-circle text-[10px] mx-1"></i>
            <i className="fa fa-circle text-[10px]"></i>
        </div>
        <span className="text-sm text-gray-400">AI думает...</span>
    </div>
));

AIThinking.displayName = "AIThinking";

const FakeToolCall = memo(({ toolName, toolDescription }: { toolName: string; toolDescription: string }) => {
    return (
        <div className="flex items-start gap-1 p-2 rounded bg-zinc-800 border border-gray-700 text-success">
            <span className="font-bold">✓</span>
            <div className="flex-1">
                <div className="font-semibold">{toolName}</div>
                <div className="text-sm text-gray-400">{toolDescription}</div>
            </div>
        </div>
    );
});

FakeToolCall.displayName = "FakeToolCall";

const FakeUserMessage = memo(({ userPrompt }: { userPrompt: string }) => {
    return (
        <div className="flex justify-end">
            <div className="px-2 py-2 rounded-lg bg-zinc-700 text-white max-w-[calc(100%-20px)]">
                <div className="whitespace-pre-wrap break-words">{userPrompt}</div>
            </div>
        </div>
    );
});

FakeUserMessage.displayName = "FakeUserMessage";

const FakeAssistantMessage = memo(({ config, onComplete }: { config: ChatConfig; onComplete?: () => void }) => {
    const [phase, setPhase] = useState<"thinking" | "tool" | "streaming">("thinking");
    const [streamedText, setStreamedText] = useState("");

    useEffect(() => {
        const timeouts: NodeJS.Timeout[] = [];
        let streamInterval: NodeJS.Timeout | null = null;

        const runAnimation = () => {
            setPhase("thinking");
            setStreamedText("");

            timeouts.push(
                setTimeout(() => {
                    setPhase("tool");
                }, 2000)
            );

            timeouts.push(
                setTimeout(() => {
                    setPhase("streaming");
                }, 4000)
            );

            timeouts.push(
                setTimeout(() => {
                    let currentIndex = 0;
                    streamInterval = setInterval(() => {
                        if (currentIndex >= config.markdownResponse.length) {
                            if (streamInterval) {
                                clearInterval(streamInterval);
                                streamInterval = null;
                            }
                            if (onComplete) {
                                onComplete();
                            }
                            return;
                        }
                        currentIndex += 10;
                        setStreamedText(config.markdownResponse.slice(0, currentIndex));
                    }, 100);
                }, 4000)
            );
        };

        runAnimation();

        return () => {
            timeouts.forEach(clearTimeout);
            if (streamInterval) {
                clearInterval(streamInterval);
            }
        };
    }, [config.markdownResponse, onComplete]);

    return (
        <div className="flex justify-start">
            <div className="px-2 py-2 rounded-lg">
                {phase === "thinking" && <AIThinking />}
                {phase === "tool" && (
                    <>
                        <div className="mb-2">
                            <FakeToolCall toolName={config.toolName} toolDescription={config.toolDescription} />
                        </div>
                        <AIThinking />
                    </>
                )}
                {phase === "streaming" && (
                    <>
                        <div className="mb-2">
                            <FakeToolCall toolName={config.toolName} toolDescription={config.toolDescription} />
                        </div>
                        <WaveStreamdown text={streamedText} parseIncompleteMarkdown={true} className="text-gray-100" />
                    </>
                )}
            </div>
        </div>
    );
});

FakeAssistantMessage.displayName = "FakeAssistantMessage";

const FakeAIPanelHeader = memo(() => {
    return (
        <div className="py-2 pl-3 pr-1 border-b border-gray-600 flex items-center justify-between min-w-0 bg-zinc-900">
            <h2 className="text-white text-sm font-semibold flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
                <i className="fa fa-sparkles text-accent"></i>
                Искра AI
            </h2>

            <div className="flex items-center flex-shrink-0 whitespace-nowrap">
                <div className="flex items-center text-sm whitespace-nowrap">
                    <span className="text-gray-300 mr-1 text-[12px]">Context</span>
                    <button
                        className="relative inline-flex h-6 w-14 items-center rounded-full transition-colors bg-accent-600"
                        title="Доступ к виджетам ВКЛ"
                    >
                        <span className="absolute inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-8" />
                        <span className="relative z-10 text-xs text-white transition-all ml-2.5 mr-6 text-left font-bold">
                            ON
                        </span>
                    </button>
                </div>

                <button
                    className="text-gray-400 transition-colors p-1 rounded flex-shrink-0 ml-2 focus:outline-none"
                    title="Дополнительные опции"
                >
                    <i className="fa fa-ellipsis-vertical"></i>
                </button>
            </div>
        </div>
    );
});

FakeAIPanelHeader.displayName = "FakeAIPanelHeader";

export const FakeChat = memo(() => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [chatIndex, setChatIndex] = useState(1);
    const config = chatConfigs[chatIndex] || chatConfigs[0];

    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleComplete = () => {
        setTimeout(() => {
            setChatIndex((prev) => (prev + 1) % chatConfigs.length);
        }, 2000);
    };

    return (
        <div className="flex flex-col w-full h-full">
            <FakeAIPanelHeader />
            <div className="flex-1 overflow-hidden">
                <div ref={scrollRef} className="flex flex-col gap-1 p-2 h-full overflow-y-auto bg-zinc-900">
                    <FakeUserMessage userPrompt={config.userPrompt} />
                    <FakeAssistantMessage config={config} onComplete={handleComplete} />
                </div>
            </div>
        </div>
    );
});

FakeChat.displayName = "FakeChat";
