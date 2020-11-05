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
    const newFileName = newName();

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

const newName = () => {
    const files = fs.readdirSync(imageFolder);
    const numberOfFiles = files.length;
    let number;
    console.log(files);
    if (numberOfFiles === 0){
            //create first file name
        number = 10000000;
    } else {    
        let highestNumber = 0;
        let countIMGfiles = 0;
        //get last file name this may not be a new file name format
        for (let i = 0 ; i < files.length; i++){
            console.log(`type of ${typeof files[i]}`);
            if (files[i].substring(0, 6) == "IMAGE_"){ 
                countIMGfiles ++;
                let currentNumberStr = files[i].substring(6, 14);
                let currentNumber = currentNumberStr * 1;
                console.log(`currentNumberStr ${currentNumberStr}`);
                console.log(`currentNumber ${currentNumber}`);
                console.log(`highestNumber ${highestNumber}`);
                if (currentNumber > highestNumber){
                    highestNumber = currentNumber;
                }
            }
        }
        if (countIMGfiles === 0){
            number = 10000000;
        } else {
            number = highestNumber + 1;
        }
    
    }
    console.log(`IMAGE_${number}.jpg`);
    return `IMAGE_${number}.jpg`;
}