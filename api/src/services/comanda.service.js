import { comandaSchema } from "../models/Comanda.js"

export async function createComanda(comanda) {
  return await comandaSchema.create(comanda)
}

export async function getAllComandas() {
  return await comandaSchema.find()
}

export async function addItem(comandaId, data) {

  const comanda = await Comanda.findById(comandaId);
  const { producto_id, cantidad, notas } = data

  if (!cantidad || cantidad <= 0) {
    throw {
      status: 400,
      message: "Cantidad inválida (debe ser mayor a 0)"
    }
  }

  if (!comanda) {
    throw {
      status: 404,
      message: "Comanda no existe"
    }
  }

  if (comanda.estado !== "abierta") {
    throw {
      status: 400,
      message: "Comanda no está en estado 'abierta'"
    }
  }

  const producto = await Producto.findById(producto_id);

  if (!producto) {
    throw {
      status: 404,
      message: "Producto no existe"
    }
  }

  if (!producto.activo) {
    throw {
      status: 400,
      message: "Producto no está activo"
    }
  }

  comanda.items.push({
    producto: producto._id,
    nombre: producto.nombre,
    precio: producto.precio,
    cantidad,
    cancelado: false,
    notas
  })

  await comanda.save()

  return comanda
}

export async function changeState(id, newState) {
  if (!ESTADOS_VALIDOS.includes(newState)) {
    throw crearError('Estado inválido', 400)
  }
 
  const comanda = await Comanda.findById(id)
  if (!comanda) {
    throw crearError('Comanda no existe', 404)
  }
 
  const transicionesDesdeEstadoActual = TRANSICIONES_PERMITIDAS[comanda.estado] || []
  if (!transicionesDesdeEstadoActual.includes(newState)) {
    throw crearError(
      `Transición de estado no permitida: ${comanda.estado} -> ${newState}`,
      400
    );
  }
 
  comanda.estado = nuevoEstado
  await comanda.save()
 
  return comanda;
}
export default {
  createComanda,
  getAllComandas,
  addItem,
  changeState
};