import { Router, type IRouter } from 'express';
import { listTrips, listAllTrips, getTrip, createTrip, updateTrip, deleteTrip } from './trips.controller';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createTripSchema, updateTripSchema } from './trips.schema';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get('/', listTrips);
router.get('/:tripId', getTrip);
router.post('/', validate(createTripSchema), createTrip);
router.put('/:tripId', validate(updateTripSchema), updateTrip);
router.delete('/:tripId', deleteTrip);

const allRouter = Router();
allRouter.use(requireAuth);
allRouter.get('/', listAllTrips);

const _router: IRouter = router;
const _allRouter: IRouter = allRouter;
export { _allRouter as allTripRoutes };
export default _router;
