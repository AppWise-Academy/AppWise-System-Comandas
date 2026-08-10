import { Schema, model } from "mongoose";

const productoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "Name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Min 2 characters"],
      maxlength: [120, "Max 120 characters"],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [1000, "Max 1000 characters"],
    },
    categoria: {
      type: Schema.Types.ObjectId,
      ref: "Categoria",
      required: [true, "Category is required"],
      index: true,
    },
    precio: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    costo: {
      type: Number,
      min: [0, "Cost cannot be negative"],
    },
    disponible: {
      type: Boolean,
      default: true,
      index: true,
    },
    imagen: {
      type: String,
      default: null,
    },
    stock: {
      type: Number,
      default: -1,
      min: [-1, "Stock cannot be lower than -1"],
    },
    vendidos: {
      type: Number,
      default: 0,
      min: [0, "Sold count cannot be negative"],
      index: true,
    },
    orden: {
      type: Number,
      default: 0,
      min: [0, "Order cannot be negative"],
    },
    activo: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

productoSchema.index({ categoria: 1, activo: 1, disponible: 1, orden: 1, _id: 1 });
productoSchema.index({ activo: 1, vendidos: -1, _id: 1 });

const ProductoModel = model("Producto", productoSchema);

export default ProductoModel;

