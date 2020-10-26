const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

//pug
app.set('view engine', 'pug');

//third party middleware
app.use(morgan('dev'));
app.set('views', path.join(__dirname, 'views'));

//static images
app.use(express.static(`${__dirname}/static/`));

//create an array of the images
const imageFolder = path.join(__dirname, 'static', 'images');
const images = fs.readdirSync(imageFolder);

//routing
app.get('/', (req, res) => {
    res.status(200).render('base', {
        author: 'Andrew',
        message: 'Using Pug Locals'
    });
});

app.get('/random', (req, res) => {
    console.log(`serves a random image`);
    randomNumber(images.length).then( randomNumber => {
        console.log("Random Number in then: " + randomNumber);
        let theImage = images[randomNumber];
        res.status(200).render('random', { 
            randomImage: theImage
        });
    }).catch(err => console.log(err));
});

app.get('/gallery', async (req, res) => {
    console.log("Gallery Page");
    res.status(200).render('gallery', {
        images: images
    });
});

app.get('/upload', (req, res) => {
    res.status(200).render('upload');
});

app.post('/upload', (req, res) => {
    console.log('image upload');
});

//create an asyn function 
async function randomNumber(total){
    try{
        var num = await Math.floor(Math.random() * total);
        return num;
    } catch (err){
        console.log("There has been an error: " + err)
        throw err;
    }
}

module.exports = app;
