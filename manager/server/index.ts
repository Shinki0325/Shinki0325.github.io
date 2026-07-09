import cors from "cors";
import express from "express";
import { registerContentRoutes } from "./routes/content";
import { registerAssetRoutes } from "./routes/assets";
import { registerBirthdayRoutes } from "./routes/birthdays";
import { registerSystemRoutes } from "./routes/system";

const app = express();
const port = Number(process.env.PORT ?? 4318);

app.use(
  cors({
    origin: [/^http:\/\/127\.0\.0\.1:\d+$/, /^http:\/\/localhost:\d+$/]
  })
);
// JSON uploads are intended for small manager-local WebP data URLs; use path-copy for larger originals.
app.use(express.json({ limit: "10mb" }));

registerContentRoutes(app);
registerAssetRoutes(app);
registerBirthdayRoutes(app);
registerSystemRoutes(app);

app.listen(port, "127.0.0.1", () => {
  console.log(`Manager server listening on http://127.0.0.1:${port}`);
});
