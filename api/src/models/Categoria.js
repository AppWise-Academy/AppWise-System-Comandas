import { Schema, model } from "mongoose";

const categoriaSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "Name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Min 2 characters"],
      maxlength: [80, "Max 80 characters"],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, "Max 500 characters"],
    },
    orden: {
      type: Number,
      default: 0,
      min: [0, "Order cannot be negative"],
    },
    activa: {
      type: Boolean,
      default: true,
      index: true,
    },
    imagen: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

categoriaSchema.index({ activa: 1, orden: 1, _id: 1 });

const CategoriaModel = model("Categoria", categoriaSchema);

export default CategoriaModel;

