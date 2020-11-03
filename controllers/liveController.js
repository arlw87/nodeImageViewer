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
    const settings = readCurrentSettingSYNC();
    const timeInterval = settings.interval * 1000;

    //read in the images files and then render the page
    // fs.readdir(imageFolder, (err, files) => {
    //     console.log(files.length);
    //     var oneFile = files[random(files.length)];
    //     console.log(random(files.length));
    //     // var dimensions = sizeOf(path.join(imageFolder, oneFile));
    //     // console.log(dimensions.width, dimensions.height);
    //     res.status(200).render('live', {
    //         image: oneFile,
    //         timeInterval: timeInterval
    //     });
    // });

    const oneFile = commonFunctions.getNextImage();
    res.status(200).render('live', {
        image: oneFile,
        timeInterval: timeInterval
    });
};



exports.update = (req, res) => {
    console.log("Live update");

    //get the latest settings 
    const settings = readCurrentSettingSYNC();
    const timeInterval = settings.interval * 1000;

    //respond with json data
    //read in the images files and then render the page
    // fs.readdir(imageFolder, (err, files) => {
    //     console.log(files.length);
    //     var oneFile = files[random(files.length)];
    //     console.log(random(files.length));
    //     res.status(200).json({ 
    //         status: 'success',
    //         data: {
    //             timeInterval: timeInterval,
    //             imagePath: oneFile
    //         }    
    //     });
    // });  

    const oneFile = commonFunctions.getNextImage();
    res.status(200).json({ 
        status: 'success',
        data: {
            timeInterval: timeInterval,
            imagePath: oneFile
        }    
    });
};


const readCurrentSettingSYNC = () => {
    const settingsFile = fs.readFileSync(commonFunctions.getSettingsLocation(), 'utf8');
    return JSON.parse(settingsFile);
};

