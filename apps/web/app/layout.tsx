import "@/styles/index.css";
import { JetBrains_Mono, Outfit } from "next/font/google";

const outfit = Outfit({
    variable: "--font-outfit",
    subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-jetbrains-mono",
    subsets: ["latin"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${outfit.variable} ${jetbrainsMono.variable}`}>{children}</body>
        </html>
    );
}
