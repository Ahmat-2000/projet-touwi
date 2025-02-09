import localFont from "next/font/local";
import "./../styles/globals.css"

import { VariablesProvider } from "@/utils/VariablesContext";

const geistSans = localFont({
  src: "../styles/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../styles/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Chronos",
  description: "Application de labelisation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-[#e1ebff]">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <VariablesProvider>
          {children}
        </VariablesProvider>
      </body>
    </html>
  );
}
