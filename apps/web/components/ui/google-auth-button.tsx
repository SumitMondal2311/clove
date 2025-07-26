import Link from "next/link";
import { buttonVariants } from "./button";

export function GoogleAuthButton() {
    return (
        <Link
            href="#"
            className={buttonVariants({
                variant: "outline",
            })}
        >
            Continue with Google
        </Link>
    );
}
