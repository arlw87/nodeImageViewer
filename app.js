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
var shell = require('shelljs');

const commonFunctions = require('./commonFunctions');

//shell test 
shell.echo("Hello from shelljs");


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

//Interval function checks at regular intervals if it is time to shutdown the 
//photoframe or not

const timeIntervalPeriod = 5000; //60 * 1000 * 2; //two minutes

setInterval(() => {
    console.log("Time to shutdown down?");
    //read in the settings 
    const settingsObj = commonFunctions.readCurrentSettingSYNC();
    if (settingsObj.shutdownOption === "enabled"){
        const settingsTime = settingsObj.shutdownTime;
        //convert to a time 
        const colonPosition = settingsTime.search(":");
        const shutdownTimeHours = settingsTime.substring(0, colonPosition);
        const shutdownTimeMinutes = settingsTime.substring(colonPosition + 1, settingsTime.length);

        const numShutdownHours = shutdownTimeHours * 1;
        const numShutdownMinutes = shutdownTimeMinutes * 1;

        //current Date`
        const now = new Date();

        //create a date object from shutdown time and current day
        const shutdownTime = new Date(now.getUTCFullYear(), now.getMonth(), now.getDate(), numShutdownHours, numShutdownMinutes, 0);

        //valueOf returns time in milliseconds from 1970 epoch
        if (shutdownTime.valueOf() < now.valueOf()){
            console.log("Shutdown");
            shell.echo("Automatic shutdown of Photoframe");
            shell.exec("sudo shutdown now");
        } else {
            console.log("Dont Shutdown");
        }
    }

}, timeIntervalPeriod);

//routing

//Mounting the routers
app.use('/gallery', galleryRouter);
app.use('/upload', uploadRouter);
app.use('/', homeRouter);
app.use('/settings', settingsRouter);
app.use('/live', liveRouter);

module.exports = app;
