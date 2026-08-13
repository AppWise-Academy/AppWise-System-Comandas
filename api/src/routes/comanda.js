import express from 'express';
import { Router } from 'express';
import { 
    createComanda
    
} from '../controllers/comanda.controller.js';

const router = Router()

router.post('/comandas/', authGuard, roleGuard(['mozo', 'admin']), createComanda)


export default router
 
