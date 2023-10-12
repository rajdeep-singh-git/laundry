const { Router } = require('express');
const auth = require('./auth');
const client = require('./client');
const batch = require('./batch');
const router = Router();
const { StatusCodes } = require('http-status-codes');
const { MESSAGES } = require('../utils/enums');

// Authorization related routes
router.post('/login', auth.login);

router.post('/clients', client.addClient);
router.put('/clients/:clientId', client.updateClient);
router.get('/clients', client.getClientsByFilters);
router.get('/batch/items', batch.getBatchItems);
router.post('/clients/:clientId/batch', client.addBatch);
router.get('/clients/:clientId/batches', client.getClientsBatches);
router.put('/batch/:batchId/status', batch.updateBatchStatus);
router.put('/batch/:batchId', batch.updateBatch);
router.get('/batch/tags/:tagId', batch.getBatchDetailsByTag);

router.all('**', (req, res) => {
    res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        error: {
            message: MESSAGES.PAGE_NOT_FOUND
        }
    })
})

module.exports = router;