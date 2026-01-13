import express from "express";
import multer from "multer";
import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { getDatabase } from "../database.js";

const router = express.Router();

// Настройка папки для загрузки файлов
const FILES_DIR = join(process.cwd(), "public", "uploads", "files");
if (!existsSync(FILES_DIR)) {
  mkdirSync(FILES_DIR, { recursive: true });
}

// Настройка multer для сохранения файлов
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, FILES_DIR);
  },
  filename: (_req, file, cb) => {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.substring(file.originalname.lastIndexOf("."));
    cb(null, `file-${uniqueSuffix}${ext}`);
  },
});

// Фильтр для проверки типа файла
const fileFilter = (
  _req: express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = /\.(stl|glb|gltf|obj|f3d|step|3mf)$/i;
  const extname = allowedTypes.test(file.originalname);

  if (extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Разрешены только файлы 3D моделей (STL, GLB, GLTF, OBJ, F3D, STEP, 3MF)",
      ),
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter,
});

// POST /api/workshop/files/upload - Загрузить файл
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Файл не был загружен",
      });
    }

    // Определяем формат файла из расширения
    const ext = req.file.originalname
      .substring(req.file.originalname.lastIndexOf(".") + 1)
      .toLowerCase();

    const formatMap: Record<
      string,
      "stl" | "glb" | "gltf" | "obj" | "f3d" | "step"
    > = {
      stl: "stl",
      glb: "glb",
      gltf: "gltf",
      obj: "obj",
      f3d: "f3d",
      step: "step",
      stp: "step",
    };

    const fileFormat =
      formatMap[ext] ||
      ("stl" as "stl" | "glb" | "gltf" | "obj" | "f3d" | "step");

    // Возвращаем информацию о файле
    const fileUrl = `/uploads/files/${req.file.filename}`;

    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: fileUrl,
        fileFormat,
        fileSize: req.file.size,
      },
    });
  } catch (error) {
    console.error("Ошибка при загрузке файла:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Ошибка при загрузке файла",
    });
  }
});

// GET /api/workshop/files/:id/download - Получить информацию о файле для скачивания
router.get("/:id/download", (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const file = db
      .prepare(
        `SELECT 
          id,
          name,
          file_path as filePath,
          file_format as fileFormat,
          file_size as fileSize
        FROM workshop_files
        WHERE id = ?`,
      )
      .get(id) as
      | {
          id: string;
          name: string;
          filePath: string;
          fileFormat: string;
          fileSize: number | null;
        }
      | undefined;

    if (!file) {
      return res.status(404).json({
        success: false,
        error: "Файл не найден",
      });
    }

    // Проверяем существование файла
    const filePath = join(process.cwd(), "public", file.filePath);
    if (!existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "Файл не найден на диске",
      });
    }

    res.json({
      success: true,
      file: {
        id: file.id,
        name: file.name,
        filePath: file.filePath,
        fileFormat: file.fileFormat,
        fileSize: file.fileSize,
      },
    });
  } catch (error) {
    console.error("Ошибка при получении информации о файле:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Ошибка при получении информации о файле",
    });
  }
});

export default router;
