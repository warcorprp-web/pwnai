// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import Logo from "@/app/asset/logo.svg";
import { modalsModel } from "@/app/store/modalmodel";
import { Modal } from "./modal";

import { isDev } from "@/util/isdev";
import { useState } from "react";
import { getApi } from "../store/global";

interface AboutModalProps {}

const AboutModal = ({}: AboutModalProps) => {
    const currentDate = new Date();
    const [details] = useState(() => getApi().getAboutModalDetails());
    const [updaterChannel] = useState(() => getApi().getUpdaterChannel());

    return (
        <Modal className="pt-[34px] pb-[34px]" onClose={() => modalsModel.popModal()}>
            <div className="flex flex-col gap-[26px] w-full">
                <div className="flex flex-col items-center justify-center gap-4 self-stretch w-full text-center">
                    <Logo />
                    <div className="text-[25px]">Искра Терминал</div>
                    <div className="leading-5">
                        AI-терминал, который видит всё ваше рабочее пространство
                    </div>
                </div>
                <div className="items-center gap-4 self-stretch w-full text-center">
                    Версия {details.version} ({isDev() ? "dev-" : ""}
                    {details.buildTime})
                </div>
                <div className="flex items-center justify-center gap-[10px] self-stretch w-full text-center">
                    <a
                        href="https://cryptocatslab.ru"
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center px-4 py-2 rounded border border-border hover:bg-hoverbg transition-colors duration-200"
                    >
                        <i className="fa-sharp fa-light fa-globe mr-2"></i>Вебсайт
                    </a>
                    <a
                        href="https://t.me/deya_vocals"
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center px-4 py-2 rounded border border-border hover:bg-hoverbg transition-colors duration-200"
                    >
                        <i className="fa-brands fa-telegram mr-2"></i>Поддержка
                    </a>
                </div>
                <div className="items-center gap-4 self-stretch w-full text-center">
                    &copy; {currentDate.getFullYear()}{" "}
                    <span style={{
                        background: 'linear-gradient(to right, #00bfff, #ff6600)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontWeight: 'bold'
                    }}>
                        CryptoCat's Lab
                    </span>
                </div>
            </div>
        </Modal>
    );
};

AboutModal.displayName = "AboutModal";

export { AboutModal };
