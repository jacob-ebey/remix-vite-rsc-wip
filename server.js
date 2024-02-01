import express from "express";
// @ts-expect-error - no types
import RSDS from "@vinxi/react-server-dom-vite/server";

const app = express();

app.get("*", (req, res) => {
  const data = (req.headers["routes"] || "")
    .split(",")
    .reduce((p, c) => Object.assign(p, { [c]: c }), {});

  const { pipe } = RSDS.renderToPipeableStream(data);
  pipe(res);
});

const port = process.env.PORT || 3001;
app.listen(port, () =>
  console.log(`Express server listening at http://localhost:${port}`)
);
