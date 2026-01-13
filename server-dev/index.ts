import express from "express";
import cors from "cors";
import { join } from "node:path";
import { initDatabase, closeDatabase } from "./database.js";
import workshopRouter from "./routes/workshop.js";
import filesRouter from "./routes/files.js";

const app = express();
const PORT = process.env.DEV_SERVER_PORT
  ? Number(process.env.DEV_SERVER_PORT)
  : 3001;

// Инициализация базы данных
initDatabase();

// Middleware
app.use(cors());
// Увеличиваем лимит размера тела запроса до 50MB (для больших файлов)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Статическая раздача загруженных файлов
const uploadsDir = join(process.cwd(), "public", "uploads");
app.use("/uploads", express.static(uploadsDir));

// API Routes
app.use("/api/workshop", workshopRouter);
app.use("/api/workshop/files", filesRouter);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Обработка ошибок лимита размера запроса
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (
      err &&
      typeof err === "object" &&
      "type" in err &&
      err.type === "entity.too.large"
    ) {
      console.error("Ошибка: размер запроса слишком большой");
      res.status(413).json({
        success: false,
        message: "Размер данных слишком большой. Максимальный размер: 50MB",
      });
    } else {
      next(err);
    }
  },
);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Остановка сервера...");
  closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Остановка сервера...");
  closeDatabase();
  process.exit(0);
});

app
  .listen(PORT, () => {
    console.log(`\n🚀 Dev сервер запущен на порту ${PORT}`);
    console.log(`📁 База данных: data/database.db`);
    console.log(`📁 Загруженные файлы: public/uploads/files/`);
    console.log(`\n📡 API endpoints:`);
    console.log(`   GET  /api/workshop/data`);
    console.log(`   POST /api/workshop/save`);
    console.log(`   POST /api/workshop/files/upload`);
    console.log(`   GET  /api/workshop/files/:id/download`);
    console.log(`\n`);
  })
  .on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `\n❌ Порт ${PORT} уже занят. Попробуйте:\n   1. Остановить процесс, использующий порт ${PORT}\n   2. Или установить переменную окружения DEV_SERVER_PORT с другим портом\n`,
      );
      process.exit(1);
    } else {
      console.error("❌ Ошибка при запуске сервера:", err);
      process.exit(1);
    }
  });
