const db = require('../config/db');
const { sendError, sendPayloadError } = require('../utils/common');
const Joi = require('joi');
const { MESSAGES, ROLES } = require('../utils/enums');

exports.addClient = async (req, res) => {


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

    const clients = await db.executeQuery(`select email,phone from users where email=? or phone=? and role=2`, [email, phone]);

    const errors = [];

    if (clients.length > 0) {
        if (clients[0].email == email) {
            errors.push("Email already exists");
        }
        if (clients[0].phone == phone) {
            errors.push("Phone already exisys");
        }
    }

    if (errors.length > 0) {
        return res.status(400).send({
            status: 400,
            error: errors
        });
    }


    db.query(`insert into users(name,email,phone,city,state,role) values(?)`, [[name, email, phone, city, state, role]], (err, result) => {
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
        search: Joi.string().optional().allow("", null),
        pagination: Joi.object({
            page: Joi.number().integer().min(1),
            perPage: Joi.number().integer().min(1)
        }).required()
    });

    const params = personSchema.validate(req.body);

    if (params.error) {
        return sendPayloadError(res, params.error);
    }

    const { search, pagination } = params.value;

    let whereQuery = " where role=2";

    if (search && search.trim()) {

        if (/^[A-Z\sa-z]+$/.test(search)) {
            whereQuery += ` and name like '%${search}%'`;
        } else if (search.includes('@')) {
            whereQuery += ` and email like '%${search}%'`;
        } else if (/\d/.test(search)) {
            whereQuery += ` and phone like '%${search}%'`;
        }

    }

    const limit = pagination.perPage
    const offset = ((pagination.page - 1) * limit);


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
        iron: Joi.object({
            cost: Joi.number().required(),
            customPrice: Joi.boolean(),
            remarks: Joi.string()
        }),
        wash: Joi.object({
            cost: Joi.number().required(),
            customPrice: Joi.boolean(),
            remarks: Joi.string()
        }),
        dry: Joi.object({
            cost: Joi.number().required(),
            customPrice: Joi.boolean(),
            remarks: Joi.string()
        }),
        totalCost: Joi.number().required(),
        size: Joi.string().required(),
    });

    const schema = Joi.object({
        clientId: Joi.number().integer().required(),
        batch: Joi.array().items(batchItemSchema).min(1).required(),
        dueDate: Joi.string().isoDate().required(),
        tagId: Joi.string().required(),
        batchCost: Joi.number().required()
    });

    const params = schema.validate(req.body);

    if (params.error) {
        return sendPayloadError(res, params.error);
    }

    const { clientId, batch, dueDate, tagId, batchCost } = params.value;

    const insertDate = [
        clientId,
        JSON.stringify(batch),
        dueDate,
        tagId,
        batchCost
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

    const batches = await db.executeQuery(`select batch,bs.status as currentStatus,dueDate,tagId,cost from client_batch cb left join batch_status bs on bs.id=cb.currentStatus where clientId=? order by cb.id desc `, clientId);

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
                    ...batchItem
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

