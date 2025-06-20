
import jwt from 'jsonwebtoken'

export const verifyJWT = (req, res, next) => {
    console.log('Verifying JWT...')
    console.log('Welcome in the middleware verifyJWT')
    console.log('Request Headers:', req.headers);
    const authHeader = req.headers.authorization || req.headers.Authorization
    

    if (!authHeader?.startsWith('Bearer ')) {
        console.error('No token provided or invalid format')
        return res.status(401).json({ message: 'Unauthorized' , details: 'No token provided or invalid format' })
    }

    const token = authHeader.split(' ')[1]

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })
            req.user = decoded.UserInfo.username
            req.roles = decoded.UserInfo.roles
            console.log('JWT JWT JWT verified successfully:', req.user, req.roles)
            next()
        }
    )
}
