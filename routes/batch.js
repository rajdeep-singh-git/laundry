const db = require('../config/db');
const { sendError, sendPayloadError } = require('../utils/common');
const { MESSAGES } = require('../utils/enums');

/**
 * Get batch items like 'Shirt' or 'Jean' etc in array of objects
 * @param {*} req 
 * @param {*} res 
 */
exports.getBatchItems = (req, res) => {
    db.query(`select * from batch_items`, (err, result) => {
        if (err) {
            return sendError(res, err);
        }

        res.send(result);
    })
}

/**
 * Update batch status like 'Washed', 'Dried' or 'Delivered' etc
 * @param {*} req 
 * @param {*} res 
 */
exports.updateBatchStatus = async (req, res) => {
    const { status } = req.body;
    const { batchId } = req.params;

    db.query(`update client_batch set currentStatus = ? where id=?`, [status, batchId], (err, result) => {
        if (err) {
            return sendError(res, err);
        }

        res.send({
            status: 200,
            message: MESSAGES.STATUS_UPDATED
        });

    });

}

exports.getBatchDetailsByTag = async (req, res) => {
    const { tagId } = req.params;

    let batch = await db.executeQuery('select cb.id,cb.tagId,cb.batch,bs.status, cb.dueDate,cb.cost from client_batch cb left join batch_status bs on bs.id=cb.currentStatus where cb.tagId=?', tagId);

    if (batch.length == 0) {
        return res.status(200).send({
            status: 200,
            message: MESSAGES.BATCH_NOT_FOUND
        });
    }

    batch = batch[0];
    batch.batch = JSON.parse(batch.batch);

    const batchItemIds = batch.batch.map(batchItem => batchItem.itemId);

    const batch_items = await db.executeQuery('select id, name from batch_items where id in(?)', [batchItemIds]);
    const batch_items_obj = {};
    batch_items.forEach(item => batch_items_obj[item.id] = item.name);

    batch.batch = batch.batch.map(batchItem => {
        return {
            name: batch_items_obj[batchItem.itemId],
            count: batchItem.count,
            needIroning: batchItem.needIroning
        }
    });


    res.send(batch)

}