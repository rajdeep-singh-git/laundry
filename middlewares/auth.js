const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const { MESSAGES } = require('../utils/enums');
const { JWT_SECRET } = require('../env');

exports.validateToken = (req, res, next) => {

    const token = req.headers.authorization?.split("Bearer ")[1] || "";
    if (!token) {
        return res.status(StatusCodes.FORBIDDEN).send({
            status: StatusCodes.FORBIDDEN,
            error: {
                message: ReasonPhrases.FORBIDDEN
            }
        })
    }

    jwt.verify(token, JWT_SECRET, (err, data) => {
        if (err) {
            return sendInvalidToken(res);
        }
        req.user = data;
        next();
    })

}

function sendInvalidToken(res) {
    res.status(StatusCodes.UNAUTHORIZED).send({
        status: StatusCodes.UNAUTHORIZED,
        error: {
            message: ReasonPhrases.UNAUTHORIZED
        }
    })
}