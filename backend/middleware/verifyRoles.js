// Gate a route to specific roles. Must run after verifyJWT, which sets req.roles.
export const verifyRoles = (...allowedRoles) => (req, res, next) => {
    if (!req.roles?.length) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const hasAllowedRole = req.roles.some((role) => allowedRoles.includes(role));
    if (!hasAllowedRole) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    next();
};

export default verifyRoles;
