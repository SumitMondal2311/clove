import { Geist_Mono } from "next/font/google";
import "../styles/index.css";

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    display: "swap",
    subsets: ["latin"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistMono.variable} antialiased`}>{children}</body>
        </html>
    );
}
