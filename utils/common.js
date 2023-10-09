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
    console.log(err)
    return res.status(400).send({
        status: 400,
        error: {
            message: err.message.replaceAll('"', "")
        }
    })
}

exports.getConfigurations = async (...configNames) => {
    return await db.executeQuery('select feature,value from configurations where feature in (?)', [...configNames])
}