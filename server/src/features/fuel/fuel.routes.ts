import { Router, type IRouter } from 'express';
import { listFuelEntries, getFuelEntry, createFuelEntry, updateFuelEntry, deleteFuelEntry } from './fuel.controller';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createFuelEntrySchema, updateFuelEntrySchema } from './fuel.schema';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get('/', listFuelEntries);
router.get('/:entryId', getFuelEntry);
router.post('/', validate(createFuelEntrySchema), createFuelEntry);
router.put('/:entryId', validate(updateFuelEntrySchema), updateFuelEntry);
router.delete('/:entryId', deleteFuelEntry);

const _router: IRouter = router;
export default _router;
