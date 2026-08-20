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
export async function addItem(req, res) {
    try {
        const comanda = await comandaService.addItem(
            req.params.id,
            req.body
        )

        return res.status(201).json(comanda)
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message
        })
    }
}

export async function changeState(req, res, next) {
    try {
        const { id } = req.params
        const { estado } = req.body
   
        const comanda = await comandaService.cambiarEstado(id, estado)
   
        res.status(200).json(comanda)
    } catch (err) {
        next(err)
    }
}