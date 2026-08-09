
import { rateLimit } from 'express-rate-limit'
import { logEvents } from './logger.js'

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 failed login attempts per window
    skipSuccessfulRequests: true, // don't penalize users who eventually get it right
    message:
        { message: 'Too many login attempts from this IP, please try again later' },
    handler: (req, res, next, options) => {
        logEvents(`Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
        res.status(options.statusCode).send(options.message)
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

export default loginLimiter
