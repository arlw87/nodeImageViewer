const fs = require('fs');
const path = require('path');
const commonFunctions = require('./../commonFunctions');

//FILE PATHS
const imageFolder = path.join(__dirname, '..', 'static', 'images');
const imageThumbnailFolder = commonFunctions.getThumbnailImageFolderPath();

exports.liveView = (req, res) => {
    var now = new Date();
    console.log('Live Request');

    console.log(imageThumbnailFolder);

    //read in the images files and then render the page
    fs.readdir(imageThumbnailFolder, (err, files) => {
        console.log(files.length);
        var oneFile = files[random(files.length)];
        console.log(random(files.length));
        res.status(200).render('live', {
            image: oneFile
        });
    });
};

const random = (size) => {

    return Math.floor(Math.random() * size);

};