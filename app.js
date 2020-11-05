//OWN MODULES
const galleryRouter = require('./routes/galleryRoute');
const uploadRouter = require('./routes/uploadRoute');
const homeRouter = require('./routes/homeRoute');
const settingsRouter = require('./routes/settingsRoute');
const liveRouter = require('./routes/liveRoute.js');

const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const commonFunctions = require('./commonFunctions');

//pug
app.set('view engine', 'pug');

//third party middleware
app.use(morgan('dev'));
app.set('views', path.join(__dirname, 'views'));


//static images
app.use(express.static(`${__dirname}/static/`));

const imageFolder = commonFunctions.getImageFolderPath();
const imageThumbnailFolder = commonFunctions.getThumbnailImageFolderPath();

//read Image files on the drive
const images = fs.readdirSync(imageFolder);
const thumbs = fs.readdirSync(imageThumbnailFolder);


//create thumbnails when server starts upload
//loop through all images and create thumbnail. 
//This is async so server will start while the thumbnails are
//being generated so its possible that the gallery page will initially look bare
(async () => {
    for (const image of images){
        if (!thumbs.includes(`thnl-${image}`)){
            console.log("writing thumbnail....");
            try{
                await commonFunctions.writeThumbnail(image, imageFolder, imageThumbnailFolder);
                console.log("next thumbnail"); 
            } catch (err) {
                console.log("Error in App.js");
                console.log(err);
            }

        } else {
            console.log(`${image} exists in thumbs`);
        }
    }
})();

//read settings and set the photo order
commonFunctions.setPhotoOrder();
//generate the photolist
commonFunctions.generateNewPhotoList();

//routing

//Mounting the routers
app.use('/gallery', galleryRouter);
app.use('/upload', uploadRouter);
app.use('/', homeRouter);
app.use('/settings', settingsRouter);
app.use('/live', liveRouter);

module.exports = app;
