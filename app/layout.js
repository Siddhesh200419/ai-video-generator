
import {
  Outfit,
  Inter,
  Bricolage_Grotesque,
  JetBrains_Mono,
} from "next/font/google";

import "./globals.css";
import Provider from "./provider";

export const metadata = {
  title: "ReelForge - AI Short Video Generator",
  description:
    "Turn one idea into a Short people actually finish. ReelForge writes, voices, styles, and renders ready-to-post YouTube Shorts in minutes.",
};

// Base UI font
const outfit = Outfit({
  subsets: ["latin"],
});

// Caption font options
const inter = Inter({
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={outfit.className}>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
