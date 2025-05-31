const express = require('express');
const chatRouter = express.Router();
const bodyParser = require('body-parser');

const { verifyAccessToken } = require('../../../middlewares/auth/jwt/jwt.verify');

const chatController = require('./chat.controller');

chatRouter.use(bodyParser.json());
chatRouter.post('/create', verifyAccessToken, chatController.create);
chatRouter.get('/list', verifyAccessToken, chatController.list);
chatRouter.get('/read/:id', verifyAccessToken, chatController.read);
chatRouter.put('/reply', verifyAccessToken, chatController.reply);

module.exports = chatRouter;