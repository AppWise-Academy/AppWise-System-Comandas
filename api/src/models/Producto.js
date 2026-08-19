import { Schema, model } from "mongoose";

const productoSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Min 2 characters"],
      maxlength: [120, "Max 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Max 1000 characters"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Categoria",
      required: [true, "Category is required"],
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    cost: {
      type: Number,
      min: [0, "Cost cannot be negative"],
    },
    available: {
      type: Boolean,
      default: true,
      index: true,
    },
    image: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    stock: {
      type: Number,
      default: -1,
      min: [-1, "Stock cannot be lower than -1"],
    },
    sold: {
      type: Number,
      default: 0,
      min: [0, "Sold count cannot be negative"],
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      min: [0, "Order cannot be negative"],
    },
    active: {
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

productoSchema.index({ category: 1, active: 1, available: 1, order: 1, _id: 1 });
productoSchema.index({ active: 1, sold: -1, _id: 1 });

const ProductoModel = model("Producto", productoSchema);

export default ProductoModel;
