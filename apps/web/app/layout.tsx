import { Toaster } from "@/components/ui/sonner";
import "@/styles/index.css";
import localFont from "next/font/local";
import { QueryProvider } from "./query-provider";

const outfit = localFont({
    src: [
        {
            path: "./fonts/Outfit-Regular.ttf",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/Outfit-Bold.ttf",
            weight: "700",
            style: "normal",
        },
    ],
    variable: "--font-outfit",
});

const jetbrainsMono = localFont({
    src: [
        {
            path: "./fonts/JetBrainsMono-Regular.ttf",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/JetBrainsMono-Bold.ttf",
            weight: "700",
            style: "normal",
        },
    ],
    variable: "--font-jetbrains-mono",
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${outfit.variable} ${jetbrainsMono.variable}`}>
                <QueryProvider>{children}</QueryProvider>
                <Toaster />
            </body>
        </html>
    );
}
