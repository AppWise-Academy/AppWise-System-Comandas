import {Mesa} from '../models/Mesa.js';
import { Comanda } from "../models/Comanda.js";
//crud

export const obtenerMesas = async (req, res) =>{
    try {
        const {sector, estado} = req.query;
        const filtro = { activo: true};

        if(sector) filtro.sector = sector.toLowerCase();
        if(estado) filtro.estado = estado.toLowerCase();

        const mesas = await Mesa.find(filtro).populate('mozoCargo', 'nombre apellido');
        res.status(200).json(mesas);
    }catch (error){
        res.status(500).json({mensaje: 'Error al obtener las mesas', error: error.message});
    }
};

export const obtenerMesaPorId = async (req,res) =>{
    try {
        const mesa = await Mesa.findOne({_id: req.params.id, activo: true});
        if(!mesa) return res.status(404).json({mensaje: 'Mesa no encontrada'});
        res.status(200).json(mesa);
    }catch (error){
        res.status(500).json({mensaje: 'Error al obtener la mesa', error:error.message});
    }
};

export const crearMesa = async (req,res)=> {
    try{
        const nuevaMesa = new Mesa(req.validated.body);
        await nuevaMesa.save();
        res.status(201).json(nuevaMesa);
    }catch(error){
        //si la validacion falla entra acá
        res.status(400).json({mensaje: 'Error al crear la mesa', error: error.message});
    }
};

export const editarMesa = async (req, res) =>{
    try{
        const mesaActualizada = await Mesa.findOneAndUpdate(
            {_id: req.params.id, activo: true},
            req.validated.body,
            {new: true, runValidators: true}
        );
        if (!mesaActualizada) return res.status(404).json({mensaje: 'Mesa no encontrada'});
        res.status(200).json(mesaActualizada);
    }catch(error){
        res.status(404).json({mensaje: 'Error al actualizar la mesa', error: error.message});
    }
}

export const eliminarMesa = async (req, res) => {
  try {
    // Implementamos el Soft Delete cambiando activo a false
    const mesaEliminada = await Mesa.findOneAndUpdate(
      { _id: req.params.id, activo: true },
      { activo: false },
      { new: true },
    );

    if (!mesaEliminada)
      return res.status(404).json({ mensaje: "Mesa no encontrada" });

    res
      .status(200)
      .json({
        mensaje: "Mesa marcada como inactiva correctamente",
        mesa: mesaEliminada,
      });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al eliminar la mesa", error: error.message });
  }
};


//Operaciones

export const abrirMesa = async (req, res) =>{
    try{
        const {id} = req.params;
        const {comensales, mozoCargo} = req.validated.body;

        const mesa = await Mesa.findOne({_id: id, activo: true});
        if(!mesa) return res.status(404).json({mensaje: 'Mesa no encontrada'})
        
        if(mesa.estado === 'ocupada'){
            return res.status(400).json({mensaje: 'No se puede abrir la mesa porque esta ocupada'})
        }

        if(comensales > mesa.capacidad){
            return res.status(400).json({mensaje: `Los comensales (${comensales}) superan la capacidad (${mesa.capacidad})`});
        }

        mesa.estado ='ocupada';
        mesa.mozoCargo = mozoCargo;
        mesa.comensales = comensales;
        mesa.horaApertura = new Date();
        mesa.horaCierre = null;

        await mesa.save();
        res.status(200).json(mesa);
    }catch(error){
        res.status(500).json({mensaje: 'Error al abrir la mesa', error: error.message});
    }
};

export const liberarMesa = async (req, res) => {
  try {
    const { id } = req.params;
    const mesa = await Mesa.findOne({ _id: id, activo: true });
    if (!mesa) return res.status(404).json({ mensaje: "Mesa no encontrada" });

    if (mesa.estado === "disponible") {
      return res.status(400).json({ mensaje: "La mesa ya está disponible" });
    }

    mesa.estado = "disponible";
    mesa.mozoCargo = null;
    mesa.comensales = 0;
    mesa.comandaRef = null;
    mesa.horaCierre = new Date();

    await mesa.save();
    res.status(200).json(mesa);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al liberar la mesa", error: error.message });
  }
};

export const obtenerCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    const mesa = await Mesa.findOne({ _id: id, activo: true }).populate(
      "comandaRef",
    );
    if (!mesa) return res.status(404).json({ mensaje: "Mesa no encontrada" });

    if (mesa.estado !== "ocupada"){
      return res.status(404).json({ mensaje: "La mesa no está ocupada" });
    }
    let totalAPagar = 0;
    let comandas = [];
    if (mesa.comandaRef && mesa.comandaRef.items) {
      const itemsValidos = mesa.comandaRef.items.filter(
        (item) => !item.cancelado,
      );
      totalAPagar = itemsValidos.reduce((acc, item) => acc + item.precio, 0);
      comandas = [
        {
          _id: mesa.comandaRef._id,
          items: itemsValidos,
        },
      ];
    }
    res.status(202).json({
      mesa: {
        _id: mesa._id,
        numero: mesa.numero,
        capacidad: mesa.capacidad,
        sector: mesa.sector,
        comensales: mesa.comensales,
      },
      comandas,
      totalAPagar,
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al obtener la cuenta", error: error.message });
  }
};


export const obtenerEstadisticas = async (req, res) => {
  try {
    const stats = await Mesa.aggregate([
      { $match: { activo: true } },
      {
        $group: {
          _id: null,
          totalMesas: { $sum: 1 },
          mesasOcupadas: {
            $sum: { $cond: [{ $eq: ["$estado", "ocupada"] }, 1, 0] },
          },
          mesasDisponibles: {
            $sum: { $cond: [{ $eq: ["$estado", "disponible"] }, 1, 0] },
          },
          totalComensales: { $sum: "$comensales" },
        },
      },
    ]);

    const ocupacionPorSector = await Mesa.aggregate([
      { $match: { activo: true } },
      {
        $group: {
          _id: "$sector",
          mesasEnSector: { $sum: 1 },
          ocupadas: {
            $sum: { $cond: [{ $eq: ["$estado", "ocupada"] }, 1, 0] },
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return res
        .status(200)
        .json({ mensaje: "No hay datos suficientes para estadisticas" });
    }
    const { totalMesas, mesasOcupadas, mesasDisponibles, totalComensales } =
      stats[0];
    const promedioComensales =
      mesasOcupadas > 0 ? (totalComensales / mesasOcupadas).toFixed(2) : 0;

    res.status(200).json({
      ocupacionActual: {
        total: totalMesas,
        ocupadas: mesasOcupadas,
        disponibles: mesasDisponibles,
      },
      promedioComensales: parseFloat(promedioComensales),
      ocupacionPorSector: ocupacionPorSector.map((sector) => ({
        sector: sector._id,
        total: sector.mesasEnSector,
        ocupadas: sector.ocupadas,
        porcentajeOcupacion: Math.round(
          (sector.ocupadas / sector.mesasEnSector) * 100 + "%",
        ),
      })),
    });
  } catch (error) {
    res
      .status(500)
      .json({
        mensaje: "Error al generar las estadísticas",
        error: error.message,
      });
  }
};
