const fs = require('fs');
const path = require('path');
var parser = require('exif-parser');
var commonFunctions = require('./../commonFunctions');

//FILE PATHS
const imageFolder = path.join(__dirname, '..', 'static', 'images');
const imageThumbnailFolder = path.join(__dirname, '..', 'static', 'images-thumbnails');

exports.galleryFunc = async (req, res) => {
    console.log(imageThumbnailFolder)
    //need to check if there are more images then thumbsnails
    //if there are you need to add more thumbnails 
    //otherwise if image is sent via gmail or gdrive it show until server restarted

    //read in the images files and then render the page
    fs.readdir(imageThumbnailFolder, (err, files) => {
        console.log(files);

        //order files to so show recent ones first
        const sortedFiles = commonFunctions.orderFilesByUpload(files, commonFunctions.getThumbnailImageFolderPath());
        res.status(200).render('gallery', {
            images: sortedFiles
        });
    });
}

exports.imageDetailFunc = (req, res) => {
    console.log("Params: " + req.params.imageDetail);
    const imageDetail = req.params.imageDetail;
    const imageName = imageDetail.substring(5, imageDetail.length)

    console.log(path.join(imageFolder, imageName));
    //test out the image detail parser
    res.status(200).render('imageDetail', { 
            imageName: imageName
        });

}

exports.deleteImage = (req, res) => {
    const imageToDelete = req.params.imageToDelete;
    console.log(imageToDelete);

    //delete the image
    fs.unlink(path.join(imageFolder, imageToDelete), (err) => {
        if (err){
            console.log(err);
        } else {
            console.log(`${imageToDelete} was deleted`)
        }
    });
    //delete the thumbnail
    fs.unlink(path.join(imageThumbnailFolder, `thnl-${imageToDelete}`), (err) => {
        if (err){
            console.log(err);
        } else {
            console.log(`${imageToDelete} thumbnail was deleted`)
        }
    });

    //delete it from the current running list
    commonFunctions.deleteImageFromList(imageToDelete);

    res.status(200).render('delete');
};

exports.showImageOnFrame = (req, res) => {
    const imageToShow = req.params.imageToShow;
    console.log("test");
    //show the image next in the slideshow
    commonFunctions.showImageNextOnFrame(imageToShow);

    let pageName = `${imageToShow}`;
    console.log(pageName);
    //res.end();
    res.status(200).render('imageDetail', { 
        imageName: pageName
    });
};
