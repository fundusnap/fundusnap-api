const express = require('express');
const apiRouter = express.Router();

const userRouter = require('../domainsprev/users/entities/user.router');
const projectRouter = require('../domainsprev/projects/entities/project.router');

apiRouter.use('/user', userRouter);
apiRouter.use('/project', projectRouter);

module.exports = apiRouter;