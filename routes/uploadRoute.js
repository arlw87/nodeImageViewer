//IMPORTS
const express = require('express');
const controller = require('../controllers/uploadController');
const fileupload = require('express-fileupload');


//MIDDLEWARE FOR ROUTING
const router = express.Router();

router.use(fileupload());


router.route('/').get(controller.displayUploadInstructions).post(controller.uploadImage);

module.exports = router;