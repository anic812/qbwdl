import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import ParticlesComponent from "@/components/particles";
import { StatusBarProvider } from "@/lib/status-bar/context";
import StatusBarContainer from "@/components/status-bar/container";
import { FFmpegProvider } from "@/lib/ffmpeg-provider";
import SettingsForm from "@/components/ui/settings-form";
import { SettingsProvider } from "@/lib/settings-provider";
import { BackgroundProvider } from "@/lib/background-provider";

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: {
        default: "Qobuz-DL - A frontend browser client for downloading music for Qobuz.",
        template: "Qobuz-DL"
    },
    description: "A frontend browser client for downloading music for Qobuz."
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} antialiased`}>
                <FFmpegProvider>
                    <StatusBarProvider>
                        <SettingsProvider>
                            <BackgroundProvider>
                                <ThemeProvider
                                    attribute="class"
                                    defaultTheme="dark"
                                    enableSystem
                                >
                                    <ParticlesComponent className="z-[-1] h-full w-full fixed" />
                                    <div className="absolute w-full p-2 z-[10]">
                                        <SettingsForm />
                                    </div>
                                    <div className="flex flex-col min-h-screen">
                                        <main className="px-6 pb-12 pt-32 md:pt-60 max-h-full relative h-full flex-1 overflow-y-auto flex flex-col items-center justify-center gap-2 z-[2] overflow-x-hidden">
                                            {children}
                                        </main>
                                        <StatusBarContainer />
                                    </div>
                                </ThemeProvider>
                            </BackgroundProvider>
                        </SettingsProvider>
                    </StatusBarProvider>
                    <script src="https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.9.7/dist/ffmpeg.min.js"></script>
                </FFmpegProvider>
            </body>
        </html>
    );
}
