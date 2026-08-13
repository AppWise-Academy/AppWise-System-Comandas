import { comandaSchema } from "../models/Comanda.js"

export async function createComanda(comanda) {
  return await comandaSchema.create(comanda)
}

export async function getAllComandas() {
  return await comandaSchema.find()
}

export async function addItem(comandaId, data) {

  const { producto_id, cantidad, notas } = data

  if (!cantidad || cantidad <= 0) {
    throw {
      status: 400,
      message: "Cantidad inválida (debe ser mayor a 0)"
    }
  }
}

export default {
  createComanda,
  getAllComandas,
  addItem
};