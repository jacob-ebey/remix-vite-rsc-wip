import * as stream from "node:stream";

import { createReadableStreamFromReadable } from "@remix-run/node";
// @ts-expect-error - no types
import RSDS from "@vinxi/react-server-dom-vite/server";

export function renderToReadableStream(data: unknown) {
  const passthrough = new stream.PassThrough();
  const { pipe } = RSDS.renderToPipeableStream(data);
  pipe(passthrough);
  return createReadableStreamFromReadable(passthrough);
}
