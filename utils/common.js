const db = require('../config/db');

exports.sendError = (res, err) => {
    console.log(err.sqlMessage);
    res.send({
        status: 500,
        error: {
            message: "Internal Server Error"
        }
    })
}

exports.sendPayloadError = (res, err) => {
    console.log(params.error)
    return res.status(422).send({
        status: 422,
        error: {
            message: "Invalid Payload"
        }
    })
}