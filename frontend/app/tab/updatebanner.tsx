import { Button } from "@/element/button";
import { atoms, getApi } from "@/store/global";
import { useAtomValue } from "jotai";
import { forwardRef, memo, useEffect, useState } from "react";

const UpdateStatusBannerComponent = forwardRef<HTMLButtonElement>((_, ref) => {
    // Система обновлений временно отключена
    return null;
});

export const UpdateStatusBanner = memo(UpdateStatusBannerComponent) as typeof UpdateStatusBannerComponent;
