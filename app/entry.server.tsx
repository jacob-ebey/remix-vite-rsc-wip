import * as stream from "node:stream";

import type { AppLoadContext, EntryContext } from "@remix-run/node";
import {
  createReadableStreamFromReadable,
  writeReadableStreamToWritable,
} from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import type { DataResult, DataStrategyFunction } from "@remix-run/router";
import { ResultType } from "@remix-run/router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
// @ts-expect-error - no types
import { createFromNodeStream } from "@vinxi/react-server-dom-vite/client";

const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext
) {
  const isBotRequest = isbot(request.headers.get("user-agent"));

  return new Promise((resolve, reject) => {
    let shellRendered = false;

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        onAllReady() {
          if (!isBotRequest) return;
          sendResponse();
        },
        onShellReady() {
          if (isBotRequest) return;
          sendResponse();
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      }
    );

    const sendResponse = () => {
      shellRendered = true;
      const body = new stream.PassThrough();
      const readable = createReadableStreamFromReadable(body);

      responseHeaders.set("Content-Type", "text/html");

      resolve(
        new Response(readable, {
          headers: responseHeaders,
          status: responseStatusCode,
        })
      );

      pipe(body);
    };

    setTimeout(abort, ABORT_DELAY);
  });
}

export const dataStrategy: DataStrategyFunction = async ({
  matches,
  request,
  type,
}) => {
  try {
    const promises: Promise<DataResult>[] = [];
    for (const match of matches) {
      const baseURL = new URL(request.url);
      const url = new URL(
        baseURL.pathname + baseURL.search,
        "http://localhost:3001"
      );
      promises.push(
        fetch(url, {
          headers: {
            Accept: "text/x-component",
            Route: match.route.id,
          },
          method: type === "action" ? "POST" : "GET",
        }).then(async (response) => {
          if (!response.body) {
            throw new Error("No RSC response body");
          }

          const [bodyA, bodyB] = response.body.tee();

          const rscReadable = new stream.PassThrough();
          writeReadableStreamToWritable(bodyA, rscReadable);
          const rsc = createFromNodeStream(rscReadable);
          const data = await rsc;

          return {
            type: ResultType.data,
            data: {
              $$typeof: Symbol.for("remix.rsc-data"),
              data,
              stream: bodyB,
            },
            headers: response.headers,
            statusCode: response.status,
          };
        })
      );
    }
    return await Promise.all(promises);
  } catch (error) {
    return matches.map(() => ({
      type: ResultType.error,
      error,
    }));
  }
};
