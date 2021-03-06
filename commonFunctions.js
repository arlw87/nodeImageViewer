const imageThumbnail = require('image-thumbnail');
const fs = require('fs');
const path = require('path');
const modifyExif = require('modify-exif');
var parser = require('exif-parser');
let photoPointer;
var photoOrderList;
var locationOfImages = "images";
var photoOrder = 'random';

const random = (size) => {
    return Math.floor(Math.random() * size);
};

exports.getImageFolderPath = () => { 
    return path.join(__dirname, 'static', 'images');
}

exports.getThumbnailImageFolderPath = () => { 
    return path.join(__dirname, 'static', 'images-thumbnails')
};

//for writing thumbnails
let options = { percentage: 75};

//create thumbnails from the main images
exports.writeThumbnail = async (image, imageFolderPath, imageThumbnailFolderPath) => {

    try{
        let orientation;

        orientation = await this.readOrientationData(path.join(imageFolderPath, image));

        console.log(`The orientation is ${orientation}`);

        //create thumbnail output is a buffer
        const thumbnail = await imageThumbnail(path.join(imageFolderPath, image), options);

        let thumbNailWithOrient;
        //if the original image has an orientation write that to the thumbnail image
        if (orientation !== 'undefined'){
            thumbNailWithOrient = await this.modifyExifOrientaion(thumbnail, orientation);
        } else {
            thumbNailWithOrient = thumbnail;
        }
            
        //thumbNailWithOrient = thumbnail;

        //write the buffered thumbnail data to a file
        await fs.writeFileSync(path.join(imageThumbnailFolderPath, `thnl-${image}`), thumbNailWithOrient); 
        
        console.log("Thumbnail Data");
        this.readOrientationData(path.join(imageThumbnailFolderPath, `thnl-${image}`));
        
    } catch (err){
        console.log("Error when writing a thumbnail");
        console.log(err);
    }
}

exports.readOrientationData = (fileLocation) =>{
    return new Promise((resolve, reject) => {
        fs.readFile(fileLocation, function (err, data) {
            var p1 = parser.create(data);
            var results = p1.parse();
            console.log(results.tags.Orientation);
            let orientation = results.tags.Orientation;

            //quick test orientation
            console.log("THESE ARE THE EXIF RESULTS");
            console.log(results);


            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                resolve(orientation);
            }
        });
    });
}




//modify the orientation of the image
exports.modifyExifOrientaion = async(buffer, orientation) => {
    let newBuffer = modifyExif(buffer, data => {
        console.log("From Modify");
        console.log(data);
        data["0th"]["274"] = orientation;
     });
    return newBuffer;     
}

exports.getSettingsLocation = () => {
    return path.join(__dirname, 'settings', 'settings.json');
};

exports.generateRandomPhotoOrder = () => {
    //get list of files in an array
    const files = fs.readdirSync(this.getImageFolderPath());
    //create a new array
    let randomOrder = [];
    //select an element randomly and then add to new array delete from old
    while (files.length > 0){
        let index = random(files.length);
        randomOrder.push(files[index]);
        files.splice(index,1);
    }
    return randomOrder;
}

exports.getNextImage = () => {
    //for debugging purposes
    console.log("Photo order @ getNextImage");
    console.log(photoOrderList);
    console.log("Pointer Value");
    console.log(photoPointer);


    //if no images in folder return a placeholder image
    if (photoOrderList.length === 0){
        return `/placeholder/no_imges.jpg`;
    }
    //if the image pointer is at the end of the photoList 
    //then generate a new photoList and reset the pointer
    if (photoPointer >= photoOrderList.length){
        console.log("regenerate list");
        photoOrderList = this.generatePhotoOrder();
        photoPointer = 0;
    } 
    //select new photo
    const photo = photoOrderList[photoPointer];
    photoPointer ++;
    //return photo locationq
    return `/${locationOfImages}/${photo}`;
}

exports.deleteImageFromList = ( imageName ) => {
    //if image exist in list then delete
    if (photoOrderList.includes(imageName)) {
        //find item
        let pos = photoOrderList.indexOf(imageName);
        //delete image from list
        photoOrderList.splice(pos, 1);
    }
}

exports.showImageNextOnFrame = (imageName) => {
    photoOrderList.splice(photoPointer, 0, imageName);
}


//Insert new image into the photolist
exports.insertNewImage = ( imageName ) => {
    console.log(`photo Order is set to ${this.getPhotoOrder()}`);
    if (this.getPhotoOrder() === "random"){
        //new image to display straight away
        //insert into index of array
        photoOrderList.splice(photoPointer, 0, imageName);
    } else {
        //regenerate the photolist again
        //as it is set to upload order it will put the new image
        //first
        //start the pointer from the beginning
        photoOrderList = this.generatePhotoOrder();
        photoPointer = 0;
    }
    console.log("Photo ORDER after insert image(s)");
    console.log(photoOrderList);
}

// //for when multiple images are add via email
// exports.insertNewImages = ( imagesArray ) => {
//     if (this.getPhotoOrder === "random"){
//         //new images to display straight away
//         //insert into index of array
//         imagesArray.forEach((element) => {
//             photoOrderList.splice(photoPointer, 0, element);
//         });
        
//     } else {
//         //regenerate photolist and start from beginning
//         photoOrderList = this.generatePhotoOrder();
//         photoPointer = 0;
//     }
// }

exports.generateNewPhotoList = () => {
    photoPointer = 0;
    photoOrderList = this.generatePhotoOrder();
}

exports.readCurrentSettingSYNC = () => {
    let settingsFile;
    try{
        settingsFile = fs.readFileSync(this.getSettingsLocation(), 'utf8');
    } catch {
        //if no settings create a default object and turn to a JSON
        const settingsFileObj = {
            interval : 30,
            photoOrder :"random",
            shutdownOption: "disabled",
            shutdownTime: ""
        }
        settingsFile = JSON.stringify(settingsFileObj);
        //save a default version to the file system
        this.saveSettingsSYNC(settingsFileObj.interval, settingsFileObj.photoOrder);
    }
    return JSON.parse(settingsFile);
};

exports.saveSettingsSYNC = (interval, photoOrder, shutdownOption, shutdownTime) => {
    //construct a JSON object
    //Save the JSON object to a file
    const settings = {
        interval: interval,
        photoOrder: photoOrder,
        shutdownOption: shutdownOption,
        shutdownTime: shutdownTime
    };
    const settingsJSON = JSON.stringify(settings);
    fs.writeFileSync(this.getSettingsLocation(), settingsJSON, 'utf8');
    return settings;
};


exports.getPhotoOrder = () => {
    const settingsFile = this.readCurrentSettingSYNC();
    return settingsFile.photoOrder;
}

exports.getTimeInterval = () => {
    const settingsFile = this.readCurrentSettingSYNC();
    return settingsFile.interval * 1000;
}

exports.orderFilesByUpload = (files, directory) => { 
    const imageDir = directory;
    
    //create a new array with the file and file modified time
    files = files.map(function(fileName) {
        console.log(`imageDir ${path.join(imageDir, fileName)}`);
        return {
            name: fileName,
            time: fs.statSync(path.join(imageDir, fileName)).birthtimeMs,
        };
    });

    //sort these files
    files = files.sort(function(a, b) {
        return b.time - a.time;
    })

    files = files.map(function(file) {
        return file.name;
    })
    return files;
}

exports.generatePhotoListUploadOrder = () => {
    const imageDir = this.getImageFolderPath();
    let files = fs.readdirSync(imageDir);
    
    //create a new array with the file and file modified time
    files = files.map(function(fileName) {
        console.log(`imageDir ${path.join(imageDir, fileName)}`);
        return {
            name: fileName,
            time: fs.statSync(path.join(imageDir, fileName)).birthtimeMs,
        };
    });

    //sort these files
    files = files.sort(function(a, b) {
        return b.time - a.time;
    })

    files = files.map(function(file) {
        return file.name;
    })

    console.log("Files in ordered of being uploaded");
    console.log(files);
    return files;
}

exports.setPhotoOrder = () => {
    photoOrder = this.getPhotoOrder();
    console.log(`Photo order is ${photoOrder}`);
}

//generate a new photo list 
exports.generatePhotoOrder = () => {
    if (photoOrder === "random"){ 
        //return a random list
        return this.generateRandomPhotoOrder();
    } else {
        //photo order of upload
        return this.generatePhotoListUploadOrder();
    }
}

exports.newFileName = () => {
    const imageFolder = this.getImageFolderPath();
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