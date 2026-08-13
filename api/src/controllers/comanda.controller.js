import comandaService from "../services/comanda.service.js"

export async function createComanda(req, res) {
  try {
    const { mesa, mozo } = req.body

    const comanda = await comandaService.create({
      mesa,
      mozo,
      items: [],
      estado: "abierta",
    })

    res.status(201).json(comanda)
  } catch (error) {
    return res.status(400).json({
      mensaje: "Mesa no existe o no está disponible",
    })
  }
}


