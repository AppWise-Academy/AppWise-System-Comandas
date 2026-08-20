import {Schema, model} from 'mongoose';

const mesaSchema = new Schema(
{
    numero:{
        type:Number,
        required: [true, 'El numero de la mesa es obligatorio'],
        unique: true
    },
    capacidad:{
        type:Number,
        required: [true, 'La capacidad es obligatoria'],
        min: [1, 'La capacidad debe ser mayor a 0'],
    },
    sector:{
        type: String,
        required: [true, 'El sector es obligatorio'],
        trim: true,
        lowercase: true, //ej: "patio", "salon", "terraza"
    },
    estado:{
        type: String,
        enum: ['disponible', 'ocupada', 'cerrada'],
        default: 'disponible',
    },
    mozoCargo:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    comensales:{
        type: Number,
        default: 0,
    },
    horaApertura:{
        type: Date,
        default: null,
    },
    horaCierre:{
        type: Date,
        default: null,
    },
    comandaRef:{
        type: Schema.Types.ObjectId,
        ref: 'Comanda',
        default: null,
    },
    activo:{
        type: Boolean,
        default: true, // para soft delete
    },
},
{
    timestamps: true, // crea createdAt y updatedAt
}
);

// Validacion previa a guardar para controlar que comensales <= capacidad
mesaSchema.pre('save', function() {
    if (this.comensales > this.capacidad) {
        throw new Error('El número de comensales no puede ser mayor a la capacidad de la mesa');
    }
});

export const Mesa = model('Mesa', mesaSchema);