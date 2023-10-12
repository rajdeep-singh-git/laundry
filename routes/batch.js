const db = require('../config/db');
const { sendError, sendPayloadError, getConfigurations, batchItemSchema, sendEmail } = require('../utils/common');
const { MESSAGES, CONFIGURATIONS, BATCH_STATUS } = require('../utils/enums');
const moment = require('moment');
const Joi = require('joi');
const { EMAIL_TEMPLATES, EMAIL_SUBJECTS, getEmailTemplate } = require('../utils/emailTemplates');
const { StatusCodes } = require('http-status-codes');

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

        result.map(m => m.sizes = JSON.parse(m.sizes));

        res.send({
            status: StatusCodes.OK,
            records: result
        });
    });
}

/**
 * Update batch status like 'Washed', 'Dried' or 'Delivered' etc
 * @param {*} req 
 * @param {*} res 
 */
exports.updateBatchStatus = async (req, res) => {

    const schema = Joi.object({
        status: Joi.string().valid(...Object.values(BATCH_STATUS)).required(),
    });

    const params = schema.validate(req.body);

    if (params.error) {
        return sendPayloadError(res, params.error);
    }

    const { status } = params.value;
    const { batchId } = req.params;

    let batchStatusId = db.executeQuery('select id from batch_status where status=?', status);
    let client = db.executeQuery('select name,email from users where id = (select clientId from client_batch where id=?)', batchId);

    const data = await Promise.all([batchStatusId, client]);

    batchStatusId = data[0][0].id;
    client = data[1][0];


    if (!client) {
        return res.status(StatusCodes.NOT_FOUND).send({
            status: StatusCodes.NOT_FOUND,
            error: {
                message: MESSAGES.BATCH_NOT_FOUND
            }
        })
    }

    db.query(`update client_batch set currentStatus=?, updatedAt=now() where id=?`, [batchStatusId, batchId], async (err, result) => {
        if (err) {
            return sendError(res, err);
        }

        const clothesCount = (await db.executeQuery('select json_length(batch) as count from client_batch where id=?', batchId))[0].count;
        const configurations = await getConfigurations([CONFIGURATIONS.LATE_PICKUP_FEE, CONFIGURATIONS.LATE_DAYS]);
        const CONFIG_VALUE = {};
        configurations.forEach(c => CONFIG_VALUE[c.feature] = JSON.parse(c.value));

        let subject = "";
        let message = "";

        if (status == BATCH_STATUS.READY_FOR_PICKUP) {
            subject = EMAIL_SUBJECTS.BATCH_READY_FOR_PICKUP
            message = getEmailTemplate(EMAIL_TEMPLATES.BATCH_READY_FOR_PICKUP, {
                name: client.name,
                datetime: moment().format("DD-MMM-YYYY HH:mm:ss"),
                count: clothesCount,
                fine: CONFIG_VALUE[CONFIGURATIONS.LATE_PICKUP_FEE],
                fineAfterDays: CONFIG_VALUE[CONFIGURATIONS.LATE_DAYS]
            })
        }
        else if (status == BATCH_STATUS.DELIVERED) {
            subject = EMAIL_SUBJECTS.BATCH_DELIVERED;
            message = getEmailTemplate(EMAIL_TEMPLATES.BATCH_DELIVERED, {
                name: client.name,
                datetime: moment().format("DD-MMM-YYYY HH:mm:ss"),
                count: clothesCount
            })
        }
        else if (status == BATCH_STATUS.CANCELLED) {
            subject = EMAIL_SUBJECTS.BATCH_CANCELLED;
            message = getEmailTemplate(EMAIL_TEMPLATES.BATCH_CANCELLED, {
                name: client.name,
                datetime: moment().format("DD-MMM-YYYY HH:mm:ss"),
                count: clothesCount
            })
        }

        if (subject && message) {
            sendEmail({
                to: client.email,
                subject,
                message,
                callback: (err, result) => {
                    if (err) {
                        console.log("*************** Error in sending Email *******************");
                        console.log(err);
                        console.log("************** Finish email error *********************")
                    }
                }
            });
        }

        res.send({
            status: StatusCodes.OK,
            message: MESSAGES.STATUS_UPDATED
        });

    });

}

/**
 * Get the details of the client batch with Cost, Tax, Fine if any and full batch details
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.getBatchDetailsByTag = async (req, res) => {
    const { tagId } = req.params;

    let batch = await db.executeQuery(`select cb.id,cb.tagId,cb.batch,bs.status, DATE_FORMAT(dueDate, '%d-%b-%Y %H:%i:%s') AS dueDate, cb.cost from client_batch cb
     left join batch_status bs on bs.id=cb.currentStatus where cb.tagId=?`, tagId);

    if (batch.length == 0) {
        return res.status(StatusCodes.NOT_FOUND).send({
            status: StatusCodes.NOT_FOUND,
            error: {
                message: MESSAGES.BATCH_NOT_FOUND
            }
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
            ...batchItem
        }
    });

    const CONFIG_VALUE = {};
    const configurations = await getConfigurations([CONFIGURATIONS.TAX_ON_BILL, CONFIGURATIONS.LATE_PICKUP_FEE, CONFIGURATIONS.LATE_DAYS]);
    configurations.forEach(c => CONFIG_VALUE[c.feature] = JSON.parse(c.value));

    batch.taxAmount = +(batch.cost / 100 * CONFIG_VALUE[CONFIGURATIONS.TAX_ON_BILL]).toFixed(2);

    if (batch.status == BATCH_STATUS.READY_FOR_PICKUP) {
        const lateDays = moment().diff(moment(batch.dueDate), 'days');
        if (lateDays > CONFIG_VALUE[CONFIGURATIONS.LATE_DAYS]) {
            const lateFee = CONFIG_VALUE[CONFIGURATIONS.LATE_PICKUP_FEE];
            const tax = CONFIG_VALUE[CONFIGURATIONS.TAX_ON_BILL];
            batch.lateFee = +lateFee.toFixed(2);
            batch.lateFeeTax = +(lateFee / 100 * tax).toFixed(2);
        }
    }

    res.send({
        status: StatusCodes.OK,
        record: batch
    });

}

/**
 * Update batch with details like batch, dueDate and batchCost
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.updateBatch = async (req, res) => {

    const schema = Joi.object({
        batchId: Joi.number().integer().min(1),
        batch: Joi.array().items(batchItemSchema).min(1).required(),
        dueDate: Joi.string().required()
    });

    req.body.batchId = req.params.batchId;

    const params = schema.validate(req.body);

    if (params.error) {
        return sendPayloadError(res, params.error);
    }

    const { batchId, batch, dueDate } = params.value;

    const batchInDb = await db.executeQuery(`select id from client_batch where id=?`, batchId);
    if (batchInDb.length == 0) {
        return res.status(StatusCodes.NOT_FOUND).send({
            status: StatusCodes.NOT_FOUND,
            error: {
                message: MESSAGES.BATCH_NOT_FOUND
            }
        });
    }

    const batchItemIds = batch.map(b => b.itemId);

    const batchItems = (await db.executeQuery(`select id from batch_items where id in(?)`, batchItemIds));
    const invalidBatchIdErrors = [];

    batchItemIds.forEach((itemId, index) => {
        if (!batchItems.find(bi => bi.id == itemId)) {
            invalidBatchIdErrors.push(`Batch item at position ${index + 1} with itemId ${itemId} is Invalid`);
        }
    });

    if (invalidBatchIdErrors.length > 0) {
        return res.status(StatusCodes.BAD_REQUEST).send({
            status: StatusCodes.BAD_REQUEST,
            error: invalidBatchIdErrors
        })
    }

    let batchCost = 0;

    batch.forEach((item, index) => {
        let ironWashDryCost = 0;

        Object.values(item).forEach(item => {
            if (item.cost) {
                ironWashDryCost += item.cost;
            }
        });

        item.totalCost = ironWashDryCost;
        batchCost += ironWashDryCost;
    });

    const updateData = [
        JSON.stringify(batch),
        dueDate,
        batchCost,
        batchId
    ];

    db.query('update client_batch set batch=?,dueDate=?,cost=?,updatedAt=now() where id=?', updateData, (err, result) => {
        if (err) {
            return sendError(res, err);
        }

        res.send({
            status: StatusCodes.OK,
            message: MESSAGES.BATCH_UPDATED
        });
    });


}