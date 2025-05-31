const express = require('express');
const serviceRouter = express.Router();

const predictRouter = require('./predict/predict.router');
const chatRouter = require('./chat/chat.router');

serviceRouter.use('/predict', predictRouter);
serviceRouter.use('/chat', chatRouter);

module.exports = serviceRouter;