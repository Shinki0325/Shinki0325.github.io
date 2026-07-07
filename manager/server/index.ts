import cors from "cors";
import express from "express";
import { registerContentRoutes } from "./routes/content";
import { registerAssetRoutes } from "./routes/assets";
import { registerSystemRoutes } from "./routes/system";

const app = express();
const port = Number(process.env.PORT ?? 4318);

app.use(
  cors({
    origin: [/^http:\/\/127\.0\.0\.1:\d+$/, /^http:\/\/localhost:\d+$/]
  })
);
app.use(express.json({ limit: "10mb" }));

registerContentRoutes(app);
registerAssetRoutes(app);
registerSystemRoutes(app);

app.listen(port, "127.0.0.1", () => {
  console.log(`Manager server listening on http://127.0.0.1:${port}`);
});
