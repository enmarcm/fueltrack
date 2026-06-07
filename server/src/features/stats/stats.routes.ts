import { Router, type IRouter } from 'express';
import { getVehicleStats, getOverviewStats } from './stats.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/overview', getOverviewStats);
router.get('/:id', getVehicleStats);

const _router: IRouter = router;
export default _router;
