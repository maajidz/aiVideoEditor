import type { Metadata } from "next";
import { Inter, Pacifico } from "next/font/google";
import "./globals.css";
import 'remixicon/fonts/remixicon.css'
import { LayoutProvider } from "./context/LayoutContext";
import Sidebar from "@/components/Sidebar";
import BackgroundProcessingToast from "@/components/shared/BackgroundProcessingToast";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"]
});

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pacifico",
});

export const metadata: Metadata = {
  title: "Video Farming Dashboard",
  description: "AI-powered video farming application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${pacifico.variable} min-h-screen bg-slate-950 text-slate-200 flex h-screen overflow-hidden`}>
        <LayoutProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
        {children}
          </div>
          <BackgroundProcessingToast />
        </LayoutProvider>
      </body>
    </html>
  );
}
