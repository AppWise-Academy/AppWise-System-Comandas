import { configDotenv } from "dotenv";
import mongoose from 'mongoose';
import { Schema, model } from "mongoose";

export const comandaSchema = new Schema (
    {
        mesa: {
            type: Schema.Types.ObjectId,
            ref: "Mesa",
            required: true,
        },
        mozo: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [
            {
                producto: {
                    type: Schema.Types.ObjectId,
                    ref: "Producto",
                    required: true
                },
                nombre: {
                    type: String,
                    required: true
                },
                precio: {
                    type: Number,
                    required: true
                },
                cantidad: {
                    type: Number,
                    required: true,
                    min: 1
                },
                cancelado: {
                    type: Boolean,
                    default: false
                },
                notas: {
                    type: String
                }
            }
        ],
        estado: {
            type: String,
            enum: {
                values: ['abierta', 'pagando', 'cerrada'],
                default: 'abierta'
            }  
        },
        total: {
            type: Number,
            default: 0
        },
        cobradoEn: {
            type: Date,
            default: null
        },
    },
    { 
        timestamps: true, 
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    },
)

