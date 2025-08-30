"use client";

import { AUTH_ROUTES } from "@/configs/all-routes";
import { useMe } from "@/hooks/use-me";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";

export function UserProvider({ children }: { children: ReactNode }) {
    const { mutate } = useMe();
    const pathname = usePathname();

    useEffect(() => {
        if (!AUTH_ROUTES.some((route) => pathname.includes(route))) {
            mutate(undefined);
        }
    }, [mutate]);

    return children;
}
