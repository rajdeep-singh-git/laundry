const db = require('../config/db');
const bcrypt = require('bcrypt');
const { JWT_SECRET, JWT_TOKEN_EXPIRY } = require('../env');
const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/common');
const { MESSAGES } = require('../utils/enums');



exports.login = (req, res) => {

    const { username, password } = req.body;

    db.query('select * from users where username=?', username, async (err, result) => {

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
            token
        })
    })

}

function sendInvalidResponse(res) {
    res.status(401).send({
        status: 401,
        message: MESSAGES.INVALID_CREDENTIALS
    })
}