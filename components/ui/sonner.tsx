"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--paper)",
          color: "var(--ink)",
          border: "1px solid var(--rule)",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-plex), system-ui, sans-serif",
        },
      }}
      {...props}
    />
  );
}
