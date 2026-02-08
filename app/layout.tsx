import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: "Nimantran - Beautiful Event Invitations",
    template: "%s | Nimantran",
  },
  description:
    "Create and share beautiful event invitations with RSVP tracking. Free to use.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
