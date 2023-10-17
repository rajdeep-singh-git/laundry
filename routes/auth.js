const db = require('../config/db');
const bcrypt = require('bcrypt');
const { JWT_SECRET, JWT_TOKEN_EXPIRY } = require('../env');
const jwt = require('jsonwebtoken');
const { sendError, sendPayloadError } = require('../utils/common');
const { MESSAGES } = require('../utils/enums');
const Joi = require('joi');
const { StatusCodes } = require('http-status-codes');


exports.login = (req, res) => {

    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    });

    const params = schema.validate(req.body);

    if (params.error) {
        return sendPayloadError(res, params.error);
    }

    const { username, password } = params.value;

    db.query('select u.name,u.password,u.id,r.role from users u inner join roles r on r.id=u.id where u.username=?', username, async (err, result) => {

        if (err) {
            return sendError(res, err);
        }

        // if username not found
        if (result.length == 0) {
            return sendInvalidResponse(res);
        }

        const user = result[0];

        const isValid = await bcrypt.compare(password, user.password);

        // If password does not match
        if (!isValid) {
            return sendInvalidResponse(res);
        }

        const payLoad = {
            userId: user.id,
            role: 'admin'
        }

        // Create JWT token
        const token = jwt.sign(payLoad, JWT_SECRET, { expiresIn: JWT_TOKEN_EXPIRY });

        res.send({
            token,
            profile: {
                name: user.name,
                role: user.role
            }
        })
    })

}

function sendInvalidResponse(res) {
    res.status(StatusCodes.UNAUTHORIZED).send({
        status: StatusCodes.UNAUTHORIZED,
        error: {
            message: MESSAGES.INVALID_CREDENTIALS
        }
    })
}