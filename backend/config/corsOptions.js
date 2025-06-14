import { allowedOrigins } from "./allowedOrigins.js"

const corsOptions = {
    origin: (origin, callback) => {
        console.log('CORS Origin:', origin);
        console.log('Allowed Origins:', allowedOrigins);
        console.log('indexOf:', allowedOrigins.indexOf(origin));
        // Check if the origin is in the allowedOrigins array
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

export default corsOptions