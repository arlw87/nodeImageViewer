const imageThumbnail = require('image-thumbnail');
const fs = require('fs');
const path = require('path');

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

//const imageFolder = path.join(__dirname, 'static', 'images');
//const imageThumbnailFolder = path.join(__dirname, 'static', 'images-thumbnails');

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
    console.log(`Random Order, length ${randomOrder.length}`);
    console.log(randomOrder);
    return randomOrder;
}

exports.getNextImage = () => {
    console.log("Get next Image");
    console.log(randomPhotoOrderArray);
    console.log(`random Order Pointer: ${randomOrderPointer} arrayLength ${randomPhotoOrderArray.length}`)
    if (randomOrderPointer >= randomPhotoOrderArray.length){
        randomPhotoOrderArray = this.generateRandomPhotoOrder();
        randomOrderPointer = 0;
    } 
    const photo = randomPhotoOrderArray[randomOrderPointer];
    randomOrderPointer ++;
    return photo;
}

exports.deleteImageFromList = ( imageName ) => {
    if (randomPhotoOrderArray.includes(imageName)) {
        //find item
        let pos = randomPhotoOrderArray.indexOf(imageName);
        //delete image from list
        randomPhotoOrderArray.splice(pos, 1);
    }
}

exports.insertNewImage = ( imageName ) => {
    //new image to display straight away
    //insert into index of array
    randomPhotoOrderArray.splice(randomOrderPointer + 1, 0, imageName);
    console.log(randomPhotoOrderArray);
}

let randomOrderPointer = 0;
var randomPhotoOrderArray = this.generateRandomPhotoOrder();
