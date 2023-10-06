const db = require('../config/db');
const { sendError, sendPayloadError } = require('../utils/common');
const Joi = require('joi');
const { MESSAGES } = require('../utils/enums');

exports.addClient = (req, res) => {


    const personSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().pattern(new RegExp('^[0-9]{10}$')).required(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
    });


    const params = personSchema.validate(req.body);

    if (params.error) {
        return sendPayloadError(res, params.error);
    }

    const { name, email, phone, city, state } = params.value;

    db.query(`insert into users(name,email,phone,city,state,role) values(?)`, [[name, email, phone, city, state, 2]], (err, result) => {
        if (err) {
            return sendError(res, err);
        }

        res.status(201).send({
            status: 201,
            message: MESSAGES.CLIENT_ADDED
        });

    })

}

exports.getClientsByFilters = (req, res) => {


    const personSchema = Joi.object({
        name: Joi.string().optional(),
        email: Joi.string().optional(),
        phone: Joi.string().optional(),
        pagination: Joi.object({
            page: Joi.number(),
            perPage: Joi.number()
        }).required()
    });

    const params = personSchema.validate(req.body);

    if (params.error) {
        return sendPayloadError(res, params.error);
    }

    const { name, email, phone, pagination } = params.value;

    let whereQuery = " where role=2";

    if (name && name.trim()) {
        whereQuery += ` and name like '%${name}%'`;
    }

    if (email && email.trim()) {
        whereQuery += ` and email like '%${email}%'`;
    }

    if (phone && phone.trim()) {
        whereQuery += ` and phone like '%${phone}%'`;
    }

    const limit = pagination.perPage || 10
    const offset = ((pagination.page - 1) * limit) || 0;

    db.query(`select id,name,email,phone,city,state,role from users ${whereQuery}  limit ${offset}, ${limit} `, (err, result) => {
        if (err) {
            return sendError(res, err);
        }

        res.send(result);

    })

}

exports.addBatch = (req, res) => {

    const batchItemSchema = Joi.object({
        itemId: Joi.number().integer().required(),
        count: Joi.number().integer().min(1).required(),
        needIroning: Joi.boolean().required(),
    });

    const schema = Joi.object({
        clientId: Joi.number().integer().required(),
        batch: Joi.array().items(batchItemSchema).min(1).required(),
        dueDate: Joi.string().isoDate().required(),
        tagId: Joi.string().required()
    });

    const params = schema.validate(req.body);

    if (params.error) {
        return sendPayloadError(res, params.error);
    }

    const { clientId, batch, dueDate, tagId, cost } = params.value;

    const insertDate = [
        clientId,
        JSON.stringify(batch),
        dueDate,
        tagId,
        cost
    ]

    db.query(`insert into client_batch(clientId,batch,dueDate,tagId,cost) values(?) `, [insertDate], (err, result) => {
        if (err) {
            return sendError(res, err);
        }

        res.send({
            status: 201,
            message: MESSAGES.BATCH_ADDED
        });
    });


}

exports.getClientsBatches = async (req, res) => {

    const { clientId } = req.params;

    const batches = await db.executeQuery(`select batch,bs.status as currentStatus,dueDate,tagId from client_batch cb left join batch_status bs on bs.id=cb.currentStatus where clientId=? order by cb.id desc `, clientId);

    batches.forEach(batch => {
        batch.batch = JSON.parse(batch.batch)
    });

    if (batches.length > 0) {
        const batchItemIds = Array.from(new Set(batches.map(item => item.batch.map(batchItem => batchItem.itemId))
            .reduce((acc, itemIds) => acc.concat(itemIds), [])));

        const batch_items = await db.executeQuery('select id, name from batch_items where id in(?)', [batchItemIds]);
        const batch_items_obj = {};
        batch_items.forEach(item => batch_items_obj[item.id] = item.name);

        batches.forEach(item => {
            item.batch = item.batch.map(batchItem => {

                return {
                    name: batch_items_obj[batchItem.itemId],
                    count: batchItem.count
                }
            })
        })

        return res.send(batches)
    }

    res.send({
        status: 200,
        message: MESSAGES.BATCH_NOT_FOUND
    })

}

