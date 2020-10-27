const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const fileupload = require('express-fileupload');
const imageThumbnail = require('image-thumbnail');
var parser = require('exif-parser');

let options = { percentage: 75};

//pug
app.set('view engine', 'pug');

//third party middleware
app.use(morgan('dev'));
app.set('views', path.join(__dirname, 'views'));
app.use(fileupload());

//static images
app.use(express.static(`${__dirname}/static/`));

//create an array of the images
const imageFolder = path.join(__dirname, 'static', 'images');
const imageThumbnailFolder = path.join(__dirname, 'static', 'images-thumbnails');
const images = fs.readdirSync(imageFolder);
const thumbs = fs.readdirSync(imageThumbnailFolder);

const writeThumbnail = async (image, imageFolderPath, imageThumbnailFolderPath) => {
    const thumbnail = await imageThumbnail(path.join(imageFolderPath, image), options);
    console.log(image);
    await fs.writeFileSync(path.join(imageThumbnailFolderPath, `thnl-${image}`), thumbnail);
}

//create thumbnails when server starts upload
//loop through all images and create thumbnail. 
//This is async so server will start while the thumbnails are
//being generated so its possible that the gallery page will initially look bare
(async () => {
    for (const image of images){
        if (!thumbs.includes(`thnl-${image}`)){
            writeThumbnail(image, imageFolder, imageThumbnailFolder);
        } else {
            console.log(`${image} exists in thumbs`);
        }
    }
})();

//routing
app.get('/', (req, res) => {
    res.status(200).render('home');
});

app.get('/random', (req, res) => {
    console.log(`serves a random image`);
    randomNumber(images.length).then( randomNumber => {
        console.log("Random Number in then: " + randomNumber);
        let theImage = images[randomNumber];
        res.status(200).render('random', { 
            randomImage: theImage
        });
    }).catch(err => console.log(err));
});

app.get('/gallery', async (req, res) => {
    console.log(imageThumbnailFolder)
    //need to check if there are more images then thumbsnails
    //if there are you need to add more thumbnails 
    //otherwise if image is sent via gmail or gdrive it show until server restarted

    //read in the images files and then render the page
    fs.readdir(imageThumbnailFolder, (err, files) => {
        console.log(files);
        res.status(200).render('gallery', {
            images: files
        });
    });
});

app.get('/settings', (req, res) => {
    res.status(200).render('settings');
});

app.get('/gallery/:imageDetail', (req, res) => {
    const imageDetail = req.params.imageDetail
    const imageName = imageDetail.substring(5, imageDetail.length)

    console.log(path.join(imageFolder, imageName));
    //test out the image detail parser
    fs.readFile(path.join(imageFolder, imageName), (err, file) => {
        console.log(file);
        var p1 = parser.create(file);
        var results = p1.parse();
        console.log(results);
        console.log(results.tags.Make);
        var exifData = {
            make: results.tags.Make,
            model: results.tags.Model,
            imageSize: results.tags.imageSize,
            date: results.tags.ModifyDate, 
            exposureTime: results.tags.ExposureTime,
            iso: results.tags.ISO,
            fNumber: results.tags.FNumber,
            name:imageDetail
        }

        res.status(200).render('imageDetail', { 
            imageName: imageName,
            data: exifData
        });

    });

});

app.get('/upload', (req, res) => {
    res.status(200).render('upload');
});

app.post('/upload', (req, res) => {
    console.log('image upload');
    if (!req.files || Object.keys(req.files).length === 0) {
        return uploadResponse(res, 400, "No file selected", "Try again?");
    }

    let imageUpload = req.files.imageToUpload;

    if (imageUpload.mimetype !== 'image/jpeg'){
        return uploadResponse(res, 500, "file was not a jpg image and therefore wasnt uploaded", "Try again?");
    }

    imageUpload.mv(path.join(__dirname, '/static/images', imageUpload.name), (err) => {
        if (err){
            return uploadResponse(500, `Error saving the file to the photoframe - ${err}`, "Try again?");
        }
        //needs to run after the image has saved inorder to make it a thumbnail
        writeThumbnail(imageUpload.name, imageFolder, imageThumbnailFolder);
    });   

    uploadResponse(res, 200, "Upload was Successful", "Upload another?");
});

app.post('/delete/:imageToDelete', (req, res) => {
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

    res.status(200).render('delete');
});

const uploadResponse = (res, status, result, linkText) => {
    res.status(status).render('uploadFinish', { 
        status: result,
        linkMessage: linkText
    });
};

//create an asyn function 
async function randomNumber(total){
    try{
        var num = await Math.floor(Math.random() * total);
        return num;
    } catch (err){
        console.log("There has been an error: " + err)
        throw err;
    }
}

module.exports = app;
