const express = require('express');
const authRouter = express.Router();

const { verifyRefreshToken } = require('../../../middlewares/auth/jwt/jwt.verify');

const authController = require('./user.auth.controller');
const emailAuthRouter = require('./email/auth.email.router');

authRouter.get('/refresh-token', verifyRefreshToken, authController.refresh);
authRouter.use('/email', emailAuthRouter);

module.exports = authRouter;