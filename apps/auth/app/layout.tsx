import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SidebarProvider } from "@/components/ui/sidebar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider>
          <Providers>{children}</Providers>
        </SidebarProvider>
      </body>
    </html>
  );
}
