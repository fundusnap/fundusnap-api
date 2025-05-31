const express = require('express');
const predictRouter = express.Router();

const bodyParser = require('body-parser');

const { verifyAccessToken } = require('../../../middlewares/auth/jwt/jwt.verify');

const predictController = require('./predict.controller');

predictRouter.post('/create', verifyAccessToken, bodyParser.raw({ type: 'application/octet-stream', limit: '50mb' }), predictController.create);
predictRouter.get('/list', verifyAccessToken, predictController.list);
predictRouter.get('/read/:id', verifyAccessToken, predictController.read);
predictRouter.put('/update', verifyAccessToken, bodyParser.json(), predictController.update);

module.exports = predictRouter;