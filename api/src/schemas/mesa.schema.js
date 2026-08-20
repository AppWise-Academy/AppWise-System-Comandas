import {z} from 'zod';
export const createMesaSchema = z.object({
    numero: z.number().int().positive('El numero de la mesa debe ser un número entero positivo'),
    capacidad: z.number().int().min(1, 'La capacidad debe ser al menos 1'),
    sector: z.string().min(1,'El sector es requerido'),
    estado: z.enum(['disponible', 'ocupada', 'cerrada']).optional(),
});

export const updateMesaSchema = createMesaSchema.partial();

export const abrirMesaSchema = z.object({
    comensales: z.number().int().min(1,'Debe ser al menos 1 comensal'),
    mozoCargo: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de mozo inválido (ObjectId)'), // Validación de ObjectId
});

export const liberarMesaSchema = z.object({
    totalCobrado: z.number().nonnegative().optional(),
    metodoPago: z.string().optional(),
}); 