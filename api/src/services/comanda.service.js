import { comandaSchema } from "../models/Comanda.js"

export async function createComanda(comanda) {
  return await comandaSchema.create(comanda)
}

export async function getAllComandas() {
  return await comandaSchema.find()
}



export default {
  createComanda,
  getAllComandas,
  
};