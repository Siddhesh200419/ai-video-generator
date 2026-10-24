import { Outfit } from "next/font/google";
import "./globals.css";
import Provider from "./provider";

export const metadata = {
  title: "Video Gen - AI Short Video Generator",
  description: "Create AI-powered YouTube short videos instantly",
};

const outfit = Outfit({ subsets: ["latin"] });

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