const db = require('../config/db');
const Joi = require('joi');
const nodemailer = require("nodemailer");
const { StatusCodes } = require('http-status-codes');

exports.sendError = (res, err) => {
    console.log(err.sqlMessage);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        error: {
            message: "Internal Server Error"
        }
    })
}

exports.sendPayloadError = (res, err) => {
    console.log(err)
    return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        error: {
            message: err.message.replaceAll('"', "")
        }
    })
}

exports.getConfigurations = async (...configNames) => {
    return await db.executeQuery('select feature,value from configurations where feature in (?)', [...configNames])
}

exports.batchItemSchema = Joi.object({
    itemId: Joi.number().integer().min(1).required(),
    iron: Joi.object({
        cost: Joi.number().min(0).required(),
        customPrice: Joi.boolean(),
        remarks: Joi.string()
    }),
    wash: Joi.object({
        cost: Joi.number().min(0).required(),
        customPrice: Joi.boolean(),
        remarks: Joi.string()
    }),
    dry: Joi.object({
        cost: Joi.number().min(0).required(),
        customPrice: Joi.boolean(),
        remarks: Joi.string()
    }),
    size: Joi.string().required(),
});

exports.personSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(new RegExp('^[0-9]{10}$')).required().messages({
        "string.pattern.base": "Phone is not valid. It must be of 10 digits"
    }),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
});

exports.sendEmail = ({ to, subject, message, callback }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: 'developtechphp@gmail.com',
            pass: 'mhor qndv sqor zdxu'
        },

    });

    const mailOptions = {
        from: 'developtechphp@gmail.com',
        to,
        subject,
        html: message
    };

    transporter.sendMail(mailOptions, callback);
}