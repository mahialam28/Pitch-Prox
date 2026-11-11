import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import DevelopmentNotice from "@/components/shared/development-notice";
import TableScrollHints from "@/components/shared/table-scroll-hints";

// Inter — used for titles (matches --font-secondary in globals.css @theme)
const inter = Inter({
  variable: "--font-secondary",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// Poppins — used for body/text (matches --font-primary in globals.css @theme)
const poppins = Poppins({
  variable: "--font-primary",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "PitchProx",
  description: "AI-powered sales acceleration platform",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        {/* Shows the toast() messages used across the app (none appeared before this was mounted) */}
        <Toaster position="top-right" />
        <DevelopmentNotice />
        <TableScrollHints />
      </body>
    </html>
  );
}
