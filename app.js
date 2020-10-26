const express = require('express');

const app = express();
const morgan = require('morgan');

//third party middleware
app.use(morgan('dev'));

//static images
app.use(express.static(`${__dirname}/static/images`));

//routing
app.get('/', (req, res) => {

    res.end("This is a test");

});



module.exports = app;
