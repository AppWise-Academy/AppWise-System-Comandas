import "dotenv/config";
import express from "express";
import { jest } from "@jest/globals";
import request from "supertest";
import cloudinary from "../config/cloudinary.js";
import { SETTINGS_ENV } from "../settings/index.js";

const storageOptions = [];

class FakeCloudinaryStorage {
  constructor(options) {
    storageOptions.push(options);
  }

  _handleFile(_req, file, callback) {
    let bytes = 0;
    file.stream.on("data", (chunk) => {
      bytes += chunk.length;
    });
    file.stream.on("end", () => {
      callback(undefined, {
        path: "https://res.cloudinary.com/demo/image/upload/menu/image.webp",
        filename: "appwise/menu/image",
        size: bytes,
      });
    });
  }

  _removeFile(_req, _file, callback) {
    callback();
  }
}

jest.unstable_mockModule("multer-storage-cloudinary", () => ({
  CloudinaryStorage: FakeCloudinaryStorage,
}));

const { uploadCategoriaImage, uploadProductoImage } = await import("../middlewares/uploadImage.js");
const { errorHandler } = await import("../middlewares/errorHandler.js");

function createUploadTestApp(uploadMiddleware) {
  const app = express();
  app.post("/upload", uploadMiddleware, (req, res) => {
    res.status(201).json({
      secureUrl: req.file.path,
      publicId: req.file.filename,
    });
  });
  app.use(errorHandler);
  return app;
}

describe("Upload de imágenes con Cloudinary", () => {
  it("configura Cloudinary con las variables de settings", () => {
    const config = cloudinary.config();

    expect(config.cloud_name).toBe(SETTINGS_ENV.cloudinary.cloudName);
    expect(config.api_key).toBe(SETTINGS_ENV.cloudinary.apiKey);
    expect(config.api_secret).toBe(SETTINGS_ENV.cloudinary.apiSecret);
  });

  it("configura carpetas separadas para categorías y productos", () => {
    expect(storageOptions.map(({ params }) => params.folder)).toEqual([
      "appwise-comandas/menu/categorias",
      "appwise-comandas/menu/productos",
    ]);
    expect(storageOptions[0].params.allowed_formats).toEqual(["jpg", "jpeg", "png", "webp"]);
  });

  it("acepta una imagen válida en el campo imagen y expone sus referencias", async () => {
    const response = await request(createUploadTestApp(uploadCategoriaImage))
      .post("/upload")
      .attach("imagen", Buffer.from("valid image"), "menu.webp");

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      secureUrl: "https://res.cloudinary.com/demo/image/upload/menu/image.webp",
      publicId: "appwise/menu/image",
    });
  });

  it("rechaza tipos de archivo no permitidos", async () => {
    const response = await request(createUploadTestApp(uploadCategoriaImage))
      .post("/upload")
      .attach("imagen", Buffer.from("not an image"), "menu.gif");

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_IMAGE_TYPE");
    expect(response.body.message).toContain("Only JPG");
  });

  it("rechaza imágenes mayores a 5 MB", async () => {
    const oversizedImage = Buffer.alloc(5 * 1024 * 1024 + 1, 1);
    const response = await request(createUploadTestApp(uploadProductoImage))
      .post("/upload")
      .attach("imagen", oversizedImage, "large.png");

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("IMAGE_TOO_LARGE");
    expect(response.body.message).toBe("La imagen no puede superar 5 MB");
  });

  it("oculta los detalles internos de un error de Cloudinary", async () => {
    const app = express();
    app.post("/upload", (_req, _res) => {
      const error = new Error("Cloudinary secret details");
      error.http_code = 500;
      throw error;
    });
    app.use(errorHandler);

    const response = await request(app).post("/upload");

    expect(response.status).toBe(502);
    expect(response.body.code).toBe("IMAGE_UPLOAD_FAILED");
    expect(response.body.message).toBe("No se pudo procesar la imagen");
    expect(JSON.stringify(response.body)).not.toContain("Cloudinary secret details");
  });
});
