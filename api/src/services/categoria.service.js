import CategoriaModel from "../models/Categoria.js";
import cloudinary from "../config/cloudinary.js";
import { ApiError, ConflictError, NotFoundError, ValidationError } from "../shared/errors/index.js";

function translateMongooseError(error) {
  if (error?.code === 11000) {
    throw new ConflictError("Category name is already registered", "CATEGORY_NAME_DUPLICATE");
  }

  if (error?.name === "ValidationError") {
    throw new ValidationError("Invalid category data", "CATEGORY_INVALID");
  }

  throw error;
}

// Todo: remover y agregar public id al schema
function getCloudinaryPublicId(imageUrl) {
  if (typeof imageUrl !== "string") {
    return null;
  }

  try {
    const url = new URL(imageUrl);
    const uploadMarker = "/image/upload/";
    const uploadIndex = url.pathname.indexOf(uploadMarker);

    if (uploadIndex === -1) {
      return null;
    }

    let publicId = decodeURIComponent(url.pathname.slice(uploadIndex + uploadMarker.length));
    publicId = publicId.replace(/^v\d+\//, "");

    const lastSlashIndex = publicId.lastIndexOf("/");
    const extensionIndex = publicId.lastIndexOf(".");
    if (extensionIndex > lastSlashIndex) {
      publicId = publicId.slice(0, extensionIndex);
    }

    return publicId || null;
  } catch {
    return null;
  }
}

async function destroyCloudinaryImage(publicId) {
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // La limpieza es compensatoria y no debe ocultar el error original
  }
}

export async function create(data) {
  try {
    return await CategoriaModel.create(data);
  } catch (error) {
    translateMongooseError(error);
  }
}

export async function update(id, data, { uploadedImagePublicId = null } = {}) {
  let imageToDestroy = null;

  try {
    const existingCategoria = await CategoriaModel.findById(id);

    if (!existingCategoria) {
      throw new NotFoundError("Category not found", "CATEGORY_NOT_FOUND");
    }

    const updatedCategoria = await CategoriaModel.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updatedCategoria) {
      throw new ApiError("An error has ocurred during category updating", 500, "CATEGORY_NOT_UPDATED");
    }

    imageToDestroy = uploadedImagePublicId
      ? getCloudinaryPublicId(existingCategoria.image)
      : null;

    return updatedCategoria;
  } catch (error) {
    imageToDestroy = uploadedImagePublicId;

    if (error?.name === "CastError") {
      throw new NotFoundError("Category not found", "CATEGORY_NOT_FOUND");
    }

    translateMongooseError(error);
  } finally {
    await destroyCloudinaryImage(imageToDestroy);
  }
}

export async function getAll({ skip = 0, limit = 20, activas = true } = {}) {
  const filter = { active: activas };
  const [data, totalItems] = await Promise.all([
    CategoriaModel.find(filter)
      .sort({ order: 1, name: 1, _id: 1 })
      .skip(skip)
      .limit(limit),
    CategoriaModel.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      skip,
      limit,
      totalItems,
    },
  };
}

export async function getById(id) {
  try {
    const categoria = await CategoriaModel.findById(id);

    if (!categoria) {
      throw new NotFoundError("Category not found", "CATEGORY_NOT_FOUND");
    }

    return categoria;
  } catch (error) {
    if (error?.name === "CastError") {
      throw new NotFoundError("Category not found", "CATEGORY_NOT_FOUND");
    }

    throw error;
  }
}
