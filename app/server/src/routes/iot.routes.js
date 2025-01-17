import express from 'express'
const router = express.Router();
import { getIOT } from '../controllers/iot.controllers.js';

router.get('/',getIOT);


export default router;