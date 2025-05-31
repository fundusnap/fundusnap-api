const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: [
        'http://localhost:80',
        'http://localhost:8080',
        'http://localhost:4173',
        'http://localhost:5173'
    ],
}));

const userRouter = require('./domains/users/user.router');
app.use('/user', userRouter);

const serviceRouter = require('./domains/services/services.router');
app.use('/service', serviceRouter);

// app.get('/', function(req, res) {
//   res.sendFile(path.join(__dirname, 'templates/pages/index.html'));
// });

module.exports = app;