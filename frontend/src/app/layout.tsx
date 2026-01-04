import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SignalFusion Core | SOC Command Center",
    description: "Advanced threat correlation and alert triage engine",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} flex overflow-hidden`}>
                <Sidebar />
                <main className="flex-1 h-screen overflow-y-auto bg-black/50 p-6">
                    {children}
                </main>
            </body>
        </html>
    );
}
