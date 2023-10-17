const db = require('../config/db');
const { sendError, sendPayloadError, batchItemSchema, personSchema } = require('../utils/common');
const Joi = require('joi');
const { MESSAGES, ROLES, BATCH_STATUS, USERS_COLUMMS, ORDER_BY_STATUSES, CONFIGURATIONS } = require('../utils/enums');
const { StatusCodes } = require('http-status-codes');


/**
 * Add new client to our system
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.addClient = async (req, res) => {


    const params = personSchema.validate(req.body);

    if (params.error) {
        return sendPayloadError(res, params.error);
    }

    const { name, email, phone, city, state } = params.value;

    const clients = await db.executeQuery(`select email,phone from users where email=? or phone=?`, [email, phone]);

    const errors = [];

    if (clients.length > 0) {
        if (clients[0].email == email) {
            errors.push(MESSAGES.EMAIL_EXISTS);
        }
        if (clients[0].phone == phone) {
            errors.push(MESSAGES.PHONE_EXISTS);
        }
    }

    if (errors.length > 0) {
        return res.status(StatusCodes.BAD_REQUEST).send({
            status: StatusCodes.BAD_REQUEST,
            error: errors
        });
    }

    const CLIENT_ROLE = 2;

    db.query(`insert into users(name,email,phone,city,state,role) values(?)`, [[name, email, phone, city, state, CLIENT_ROLE]], (err, result) => {
        if (err) {
            return sendError(res, err);
        }

        res.status(StatusCodes.CREATED).send({
            status: StatusCodes.CREATED,
            message: MESSAGES.CLIENT_ADDED
        });

    })

}

/**
 * Update client details in our system
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.updateClient = async (req, res) => {

    const updateSchema = personSchema.keys({
        clientId: Joi.number().integer().min(1)
    });

    req.body.clientId = req.params.clientId;

    const params = updateSchema.validate(req.body);

    if (params.error) {
        return sendPayloadError(res, params.error);
    }

    const { clientId, name, email, phone, city, state } = params.value;

    const client = (await db.executeQuery('select id from users where id=?', clientId));

    if (client.length == 0) {
        return res.status(StatusCodes.NOT_FOUND).send({
            status: StatusCodes.NOT_FOUND,
            error: {
                message: MESSAGES.CLIENT_NOT_FOUND
            }
        })
    }

    const clients = await db.executeQuery(`select email,phone from users where (email=? or phone=?) and id != ? `, [email, phone, clientId]);

    const errors = [];

    if (clients.length > 0) {
        if (clients[0].email == email) {
            errors.push(MESSAGES.EMAIL_EXISTS);
        }
        if (clients[0].phone == phone) {
            errors.push(MESSAGES.PHONE_EXISTS);
        }
    }

    if (errors.length > 0) {
        return res.status(StatusCodes.BAD_REQUEST).send({
            status: StatusCodes.BAD_REQUEST,
            error: errors
        });
    }


    db.query(`update users set name=?,email=?,phone=?,city=?,state=? where id=?`, [name, email, phone, city, state, clientId], (err, result) => {
        if (err) {
            return sendError(res, err);
        }

        res.send({
            status: StatusCodes.OK,
            message: MESSAGES.CLIENT_UPDATED
        });

    });

}

/**
 * Get clients with filters, sorting, searching and pagination
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.getClientsByFilters = async (req, res) => {

    const querySchema = Joi.object({
        search: Joi.string().optional().allow(null, ""),
        page: Joi.number().integer().min(1),
        perPage: Joi.number().integer().min(1),
        sortBy: Joi.string().valid("", ...Object.values(USERS_COLUMMS)),
        sortOrder: Joi.string().valid("", ...Object.values(ORDER_BY_STATUSES))
    });

    const params = querySchema.validate(req.query);

    if (params.error) {
        return sendPayloadError(res, params.error);
    }


    let { search, page, perPage, sortBy, sortOrder } = params.value;

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

    if (!page) page = 1;
    if (!perPage) perPage = 10;

    const limit = perPage
    const offset = ((page - 1) * limit);

    let sortSql = "";
    let limitSql = "";

    if (!sortBy) sortBy = USERS_COLUMMS.ID;
    if (!sortOrder) sortOrder = ORDER_BY_STATUSES.ASC;

    sortSql = ` order by ${sortBy} ${sortOrder}`;

    limitSql = ` limit ${offset}, ${limit} `;

    const total = (await db.executeQuery(`select count(id) total from users ${whereQuery}`))[0].total;

    db.query(`SELECT id,name,email,phone,city,state,'clients' role from users ${whereQuery} ${sortSql} ${limitSql} `, (err, result) => {
        if (err) {
            return sendError(res, err);
        }

        res.send({
            status: StatusCodes.OK,
            records: result,
            meta: {
                total,
                page,
                perPage
            }
        });

    });

}

/**
 * Add batch under client
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.addBatch = async (req, res) => {

    const schema = Joi.object({
        clientId: Joi.number().integer().min(1),
        batch: Joi.array().items(batchItemSchema).min(1).required(),
        dueDate: Joi.string().required()
    });

    req.body.clientId = req.params.clientId;

    const params = schema.validate(req.body);

    if (params.error) {
        return sendPayloadError(res, params.error);
    }

    const { clientId, batch, dueDate } = params.value;

    const client = (await db.executeQuery('select id from users where id=? and role=2', clientId));

    if (client.length == 0) {
        return res.status(StatusCodes.NOT_FOUND).send({
            status: StatusCodes.NOT_FOUND,
            error: {
                message: MESSAGES.CLIENT_NOT_FOUND
            }
        });
    }

    const batchItemIds = batch.map(b => b.itemId);

    const batchItems = (await db.executeQuery(`select id from batch_items where id in(?)`, [batchItemIds]));
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


    let totalClientBatch = db.executeQuery('select count(id) total from client_batch')
    let batchStatusId = db.executeQuery('select id from batch_status where status=?', BATCH_STATUS.WAITING_FOR_PROCESSING)

    const data = await Promise.all([totalClientBatch, batchStatusId]);
    totalClientBatch = data[0][0].total + 1;
    batchStatusId = data[1][0].id;

    const tagId = "TAG" + totalClientBatch.toString().padStart(5, 0);

    const insertDate = [
        clientId,
        JSON.stringify(batch),
        dueDate,
        tagId,
        batchCost,
        batchStatusId
    ]

    db.query(`insert into client_batch(clientId,batch,dueDate,tagId,cost,currentStatus) values(?) `, [insertDate], (err, result) => {
        if (err) {
            return sendError(res, err);
        }

        res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            tag: tagId,
            message: MESSAGES.BATCH_ADDED
        });
    });


}

/**
 * Get all the batches of clients
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.getClientsBatches = async (req, res) => {


    const querySchema = Joi.object({
        clientId: Joi.number().integer().min(1),
        page: Joi.number().integer().min(1),
        perPage: Joi.number().integer().min(1),
        sortBy: Joi.string().valid('', 'tagId', 'currentStatus', 'cost', 'dueDate', 'id'),
        sortOrder: Joi.string().valid('', ...Object.values(ORDER_BY_STATUSES))
    });

    req.query.clientId = req.params.clientId;

    const params = querySchema.validate(req.query);

    if (params.error) {
        return sendPayloadError(res, params.error);
    }


    let { clientId, page, perPage, sortBy, sortOrder } = params.value;

    if (!page) page = 1;
    if (!perPage) perPage = 10;

    const limit = perPage
    const offset = ((page - 1) * limit);

    let sortSql = "";
    let limitSql = "";

    if (!sortBy) sortBy = "bs.id";
    if (!sortOrder) sortOrder = ORDER_BY_STATUSES.ASC;

    sortSql = ` order by ${sortBy} ${sortOrder} `;


    limitSql = ` limit ${offset}, ${limit} `

    const client = await db.executeQuery(`select id from users where id=? and role=2`, clientId);
    if (client.length == 0) {
        return res.status(StatusCodes.NOT_FOUND).send({
            status: StatusCodes.NOT_FOUND,
            error: {
                message: MESSAGES.CLIENT_NOT_FOUND
            }
        })
    }

    let total = db.executeQuery(`select count(id) total from client_batch where clientId=?`, clientId);

    let batches = db.executeQuery(`select cb.id,batch,bs.status as currentStatus,DATE_FORMAT(dueDate, '%d-%b-%Y %H:%i:%s') AS dueDate,tagId,cost from client_batch cb left join batch_status bs on bs.id=cb.currentStatus where clientId=? ${sortSql} ${limitSql} `, clientId);

    const data = await Promise.all([total, batches]);
    total = data[0][0].total;
    batches = data[1];


    batches.forEach(batch => {
        batch.batch = JSON.parse(batch.batch);
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

        return res.send({
            status: StatusCodes.OK,
            records: batches,
            meta: {
                total,
                page,
                perPage
            }
        });
    }

    res.send({
        status: StatusCodes.OK,
        records: batches
    });

}

