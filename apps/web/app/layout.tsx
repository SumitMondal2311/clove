import { JetBrains_Mono, Outfit } from 'next/font/google';
import '../styles/index.css';

const outfit = Outfit({
    variable: '--font-outfit',
    display: 'swap',
    subsets: ['latin'],
});

const jet_brains_mono = JetBrains_Mono({
    variable: '--font-jet_brains_mono',
    display: 'swap',
    weight: '700',
    subsets: ['latin'],
});

export default function ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${outfit.variable} ${jet_brains_mono.variable} font-sans antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
