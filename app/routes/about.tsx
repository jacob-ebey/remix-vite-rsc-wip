import * as React from "react";
import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

async function AsyncContent() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <p>ASYNC RSC CONTENT!!!!</p>;
}

export function loader() {
  return (
    <>
      <p>STATIC RSC CONTENT FROM LOADER!!!!</p>
      <React.Suspense fallback="Loading async content...">
        <AsyncContent />
      </React.Suspense>
    </>
  );
}

export default function Index() {
  const loaderData = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>About</h1>
      {loaderData}
      <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  );
}
