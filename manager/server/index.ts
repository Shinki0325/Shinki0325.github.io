import cors from "cors";
import express from "express";
import path from "node:path";
import process from "node:process";
import { registerContentRoutes } from "./routes/content";
import { registerAssetRoutes } from "./routes/assets";
import { registerBirthdayRoutes } from "./routes/birthdays";
import { registerMusicRoutes } from "./routes/music";
import { registerSystemRoutes } from "./routes/system";
import { getRepoRoot } from "./files";

const app = express();
const port = Number(process.env.PORT ?? 4318);

try {
  process.loadEnvFile(path.join(getRepoRoot(), ".env"));
} catch {
  // Local image-host configuration is optional.
}

app.use(
  cors({
    origin: [/^http:\/\/127\.0\.0\.1:\d+$/, /^http:\/\/localhost:\d+$/]
  })
);
// Manager image uploads use data URLs before conversion; large local originals can exceed 10 MB.
app.use(express.json({ limit: "80mb" }));
app.use("/uploads", express.static(path.join(getRepoRoot(), "public", "uploads")));

registerContentRoutes(app);
registerAssetRoutes(app);
registerMusicRoutes(app);
registerBirthdayRoutes(app);
registerSystemRoutes(app);

app.listen(port, "127.0.0.1", () => {
  console.log(`Manager server listening on http://127.0.0.1:${port}`);
});
