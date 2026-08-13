import express from 'express';
import { Router } from 'express';
import { 
    createComanda,
    addItem
    
} from '../controllers/comanda.controller.js';

const router = Router()

router.post('/comandas/', authGuard, roleGuard(['mozo', 'admin']), createComanda)
router.post('/comandas/:id/items', authGuard, roleGuard(['mozo', 'admin']), addItem )

export default router
 
