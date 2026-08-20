import { Schema, model } from "mongoose";

const comandaSchema = new Schema({
  total: { type: Number, default: 0 },
});

export const Comanda = model("Comanda", comandaSchema);
