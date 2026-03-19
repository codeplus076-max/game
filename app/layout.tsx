import "../styles/globals.css";
import type { Metadata } from "next";
import AppProviders from "@/app/providers/AppProviders";

import AppLayout from "@/app/layout/AppLayout";

export const metadata: Metadata = {
  title: "Cyber Siege",
  description: "Cybersecurity game MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <AppLayout>{children}</AppLayout>
        </AppProviders>
      </body>
    </html>
  );
}
