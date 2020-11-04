const imageThumbnail = require('image-thumbnail');
const fs = require('fs');
const path = require('path');
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

exports.writeThumbnail = async (image, imageFolderPath, imageThumbnailFolderPath) => {
    const thumbnail = await imageThumbnail(path.join(imageFolderPath, image), options);
    console.log(image);
    await fs.writeFileSync(path.join(imageThumbnailFolderPath, `thnl-${image}`), thumbnail);
}

exports.getSettingsLocation = () => {
    return path.join(__dirname, 'settings', 'settings.json');
};


exports.generateRandomPhotoOrder = () => {
    console.log("GENERATE NEW RANDOM ORDER");
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
    //console.log(`Random Order, length ${randomOrder.length}`);
    console.log(randomOrder);
    return randomOrder;
}

// let photoPointer;
// var photoOrderList;

exports.getNextImage = () => {
    //if no images in folder return a placeholder image
    if (photoOrderList.length === 0){
        return `/placeholder/no_imges.jpg`;
    }

    if (photoPointer >= photoOrderList.length){
        console.log("regenerate list");
        photoOrderList = this.generatePhotoOrder();
        photoPointer = 0;
    } 
    const photo = photoOrderList[photoPointer];
    photoPointer ++;

    console.log(`pointer is ${photoPointer}, image is /${locationOfImages}/${photo}`);

    return `/${locationOfImages}/${photo}`;
}

exports.deleteImageFromList = ( imageName ) => {
    if (photoOrderList.includes(imageName)) {
        //find item
        let pos = photoOrderList.indexOf(imageName);
        //delete image from list
        photoOrderList.splice(pos, 1);
    }
}

exports.insertNewImage = ( imageName ) => {
    if (this.getPhotoOrder === "random"){
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



}

exports.generateNewPhotoList = () => {
    console.log("GENERATE NEW PHOTO LIST");
    console.log("=======================");
    photoPointer = 0;
    photoOrderList = this.generatePhotoOrder();
    console.log("==================");
    console.log("Generate PhotoList");
    console.log(photoOrderList);
    console.log("==================");
}

exports.readCurrentSettingSYNC = () => {
    const settingsFile = fs.readFileSync(this.getSettingsLocation(), 'utf8');
    return JSON.parse(settingsFile);
};


exports.getPhotoOrder = () => {
    const settingsFile = this.readCurrentSettingSYNC();
    return settingsFile.photoOrder;
}

exports.getTimeInterval = () => {
    const settingsFile = this.readCurrentSettingSYNC();
    return settingsFile.interval * 1000;
}

exports.generatePhotoListUploadOrder = () => {
    console.log("GENERATE PHOTO UPLOAD ORDER LIST");
    console.log("================================");
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

exports.generatePhotoOrder = () => {
    console.log("GENERATE PHOTO ORDER");
    console.log("=======================");
    console.log(`photoOrder is ${photoOrder}`);
    if (photoOrder === "random"){ 
        //return a random list
        return this.generateRandomPhotoOrder();
    } else {
        //photo order of upload
        return this.generatePhotoListUploadOrder();
    }
}