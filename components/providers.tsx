"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgb(var(--surface))",
            color: "rgb(var(--foreground))",
            border: "1px solid rgb(var(--border))",
            borderRadius: "12px",
          },
        }}
      />
    </ThemeProvider>
  );
}
