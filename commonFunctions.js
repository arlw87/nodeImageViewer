const imageThumbnail = require('image-thumbnail');
const fs = require('fs');
const path = require('path');

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


