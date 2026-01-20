import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const fontTitle = localFont({
  src: "./fonts/Moderniz.otf", 
  variable: "--font-title",    
});

const fontBody = localFont({
  src: "./fonts/PlusJakartaSans.ttf",  
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Gamaforce",
  description: "Universitas Gadjah Mada's Unmanned Aerial Vehicle Team",
  icons: {
    icon: '/logo.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontTitle.variable} ${fontBody.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}