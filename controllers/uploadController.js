const commonFunctions = require('./../commonFunctions');
const path = require('path');
const fs = require('fs');

const imageFolder = commonFunctions.getImageFolderPath();
const imageThumbnailFolder = commonFunctions.getThumbnailImageFolderPath();

exports.displayUploadInstructions = (req, res) => {
    res.status(200).render('upload');
}

exports.uploadImage = (req, res) => {
    console.log('image upload');
    if (!req.files || Object.keys(req.files).length === 0) {
        return uploadResponse(res, 400, "No file selected", "Try again?");
    }

    let imageUpload = req.files.imageToUpload;

    if (imageUpload.mimetype !== 'image/jpeg'){
        return uploadResponse(res, 500, "file was not a jpg image and therefore wasnt uploaded", "Try again?");
    }

    //calculate new name
    const newFileName = commonFunctions.newFileName();

    imageUpload.mv(path.join(imageFolder, newFileName), (err) => {
        if (err){
            return uploadResponse(500, `Error saving the file to the photoframe - ${err}`, "Try again?");
        }
        //needs to run after the image has saved inorder to make it a thumbnail
        commonFunctions.writeThumbnail(newFileName, imageFolder, imageThumbnailFolder);
        //needs to run after the image has saved to generate new list
        commonFunctions.insertNewImage(newFileName);
    });  
    
    uploadResponse(res, 200, "Upload was Successful", "Upload another?");
};


const uploadResponse = (res, status, result, linkText) => {
    res.status(status).render('uploadFinish', { 
        status: result,
        linkMessage: linkText
    });
};

