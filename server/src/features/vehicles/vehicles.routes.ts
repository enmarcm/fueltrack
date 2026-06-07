import { Router, type IRouter } from 'express';
import { listVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle } from './vehicles.controller';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createVehicleSchema, updateVehicleSchema } from './vehicles.schema';

const router = Router();
router.use(requireAuth);

router.get('/', listVehicles);
router.get('/:id', getVehicle);
router.post('/', validate(createVehicleSchema), createVehicle);
router.put('/:id', validate(updateVehicleSchema), updateVehicle);
router.delete('/:id', deleteVehicle);

const _router: IRouter = router;
export default _router;
