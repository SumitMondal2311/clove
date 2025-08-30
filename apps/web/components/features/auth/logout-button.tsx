"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-logout";
import { cn } from "@/lib/cn";
import { LogOut } from "lucide-react";

export const LogoutButton = () => {
    const { mutate } = useLogout();

    return (
        <Button
            onClick={() => mutate(undefined)}
            className={cn(buttonVariants({ variant: "destructive" }), "cursor-pointer")}
        >
            <LogOut />
        </Button>
    );
};
