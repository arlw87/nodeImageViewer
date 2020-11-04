const fs = require('fs');
const path = require('path');
const commonFunctions = require('./../commonFunctions');
var sizeOf = require('image-size');

//FILE PATHS
const imageFolder = commonFunctions.getImageFolderPath();
const imageThumbnailFolder = commonFunctions.getThumbnailImageFolderPath();

exports.liveView = (req, res) => {
    var now = new Date();
    console.log('Live Request');
    console.log(imageFolder);

    //get the latest settings 
    const timeInterval = commonFunctions.getTimeInterval();

    const oneFile = commonFunctions.getNextImage();

    console.log(oneFile);
    res.status(200).render('live', {
        image: oneFile,
        timeInterval: timeInterval
    });
};

exports.update = (req, res) => {
    console.log("Live update");

    //get the latest settings 
    const timeInterval = commonFunctions.getTimeInterval();

    const oneFile = commonFunctions.getNextImage();
    res.status(200).json({ 
        status: 'success',
        data: {
            timeInterval: timeInterval,
            imagePath: oneFile
        }    
    });
};




