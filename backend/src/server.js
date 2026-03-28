import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// middleware — localhost works in dev; live fails if browser origin isn't allowed.
const corsAllowList = [
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (corsAllowList.includes(origin)) return cb(null, true);
      // Vercel preview + production URLs (frontend on Vercel, API on Render)
      if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
        return cb(null, true);
      }
      cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json()); // this middleware will parse JSON bodies: req.body
app.use(rateLimiter);

// our simple custom middleware
// app.use((req, res, next) => {
//   console.log(`Req method is ${req.method} & Req URL is ${req.url}`);
//   next();
// });

app.use("/api/notes", notesRoutes);

// Only when frontend is built next to backend (monorepo deploy). On Render with Root=backend,
// ../frontend/dist does not exist — skip to avoid ENOENT; API-only is fine if UI is on Vercel.
const frontendDist = path.join(__dirname, "../frontend/dist");
const frontendIndex = path.join(frontendDist, "index.html");

if (process.env.NODE_ENV === "production" && fs.existsSync(frontendIndex)) {
  app.use(express.static(frontendDist));

  app.get("*", (req, res) => {
    res.sendFile(frontendIndex);
  });
}

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
  });

  server.on("error", (err) => {
    if (err?.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Stop the other server process or set a different PORT in backend/.env, then restart.`
      );
      process.exit(1);
    }
    throw err;
  });
});
