
import { rateLimit } from 'express-rate-limit'
import { logEvents } from './logger.js'

// Blunts automated account creation on the public /register endpoint —
// this endpoint's only real gate is that it ignores client-supplied roles,
// so it stays open to anyone; this just caps how many accounts one IP can
// create in a stretch.
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 account creations per hour
    message:
        { message: 'Too many accounts created from this IP, please try again later' },
    handler: (req, res, next, options) => {
        logEvents(`Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
        res.status(options.statusCode).send(options.message)
    },
    standardHeaders: true,
    legacyHeaders: false,
})

export default registerLimiter
