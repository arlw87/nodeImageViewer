const fs = require('fs');
const path = require('path');
const commonFunctions = require('./../commonFunctions');
var sizeOf = require('image-size');

//FILE PATHS
const imageFolder = commonFunctions.getImageFolderPath();
const imageThumbnailFolder = commonFunctions.getThumbnailImageFolderPath();

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//instead of refreshing the page you could use a ajax call 
// to get the time interval and to sent the image
// i think this would be neater.

exports.liveView = (req, res) => {
    var now = new Date();
    console.log('Live Request');
    console.log(imageFolder);

    //read in the images files and then render the page
    fs.readdir(imageFolder, (err, files) => {
        console.log(files.length);
        var oneFile = files[random(files.length)];
        console.log(random(files.length));
        // var dimensions = sizeOf(path.join(imageFolder, oneFile));
        // console.log(dimensions.width, dimensions.height);
        res.status(200).render('live', {
            image: oneFile
        });
    });
};

const random = (size) => {

    return Math.floor(Math.random() * size);

};

exports.update = (req, res) => {
    console.log("Live update");
    //respond with json data
    //read in the images files and then render the page
    fs.readdir(imageFolder, (err, files) => {
        console.log(files.length);
        var oneFile = files[random(files.length)];
        console.log(random(files.length));
        res.status(200).json({ 
            status: 'success',
            data: {
                timeInterval: 20000,
                imagePath: oneFile
            }    
        });
    });  
};


// exports.updateImage = (req, res) => {

//     console.log("Updating image");
//     var options = { 
//         root: commonFunctions.getImageFolderPath(), 
//         headers: {
//             'x-timestamp': Date.now(), 
//             'x-sent': true, 
//             'content-type': 'image/jpeg'
//         }
//     }

//     var imageFiles = commonFunctions.get

// }