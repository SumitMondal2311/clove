import { Toaster } from "@/components/ui/sonner";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "./global.css";

const outfit = Outfit({
    variable: "--font-outfit",
    display: "swap",
    subsets: ["latin"],
});

const jet_brains_mono = JetBrains_Mono({
    variable: "--font-jet-brains-mono",
    display: "swap",
    weight: "700",
    subsets: ["latin"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${outfit.variable} ${jet_brains_mono.variable} antialiased`}>
                {children}
                <Toaster />
            </body>
        </html>
    );
}
