// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

const BYOKAnnouncement = () => {
    const handleAuthorize = () => {
        // Открываем страницу авторизации
        window.open("https://api.ceiller.ru/claude-kiro-oauth/authorize", "_blank");
    };

    return (
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
                <i className="fa fa-key text-blue-400 text-lg mt-0.5"></i>
                <div className="text-left flex-1">
                    <div className="text-blue-400 font-medium mb-1">Авторизация для использования Искра AI</div>
                    <div className="text-secondary text-sm mb-3">
                        Для использования всех возможностей Искра AI необходимо пройти авторизацию через OAuth. 
                        После авторизации вам будут доступны все функции AI-ассистента.
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleAuthorize}
                            className="border border-blue-400 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-colors"
                        >
                            Авторизоваться
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

BYOKAnnouncement.displayName = "BYOKAnnouncement";

export { BYOKAnnouncement };
