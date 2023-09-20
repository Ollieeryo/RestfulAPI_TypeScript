"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatedModerator = exports.authenticatedUser = exports.authenticatedAdmin = exports.authenticateJWT = void 0;
// import * as passport from '../config/passport';
const passport = require('../config/passport');
// 驗證 JWT token
const authenticateJWT = ({ req, res, next }) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
            return res.status(401).json({ status: 'error', message: 'unauthorized' });
        }
        req.user = user;
        next();
    })(req, res, next);
};
exports.authenticateJWT = authenticateJWT;
// 辨認身分
const authenticatedAdmin = ({ req, res, next }) => {
    const user = req.user;
    if (user && user.role === 'admin')
        return next();
    return res.status(403).json({ status: 'error', message: 'permission denied' });
};
exports.authenticatedAdmin = authenticatedAdmin;
const authenticatedUser = ({ req, res, next }) => {
    const user = req.user;
    if (user && user.role === 'user')
        return next();
    return res.status(403).json({ status: 'error', message: 'permission denied' });
};
exports.authenticatedUser = authenticatedUser;
const authenticatedModerator = ({ req, res, next }) => {
    const user = req.user;
    if (user && user.role === 'moderator')
        return next();
    return res
        .status(403)
        .json({ status: 'error', message: 'role is not admin or user, permission denied' });
};
exports.authenticatedModerator = authenticatedModerator;
