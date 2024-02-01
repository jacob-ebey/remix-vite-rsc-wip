import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
// @ts-expect-error - no types
import RSDC from "@vinxi/react-server-dom-vite/client";

export default function hydrate() {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RemixBrowser />
      </StrictMode>
    );
  });
}

export function createFromReadableStream(body: ReadableStream<Uint8Array>) {
  return RSDC.createFromReadableStream(body);
}
