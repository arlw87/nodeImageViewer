//IMPORTS
const express = require('express');
const controller = require('../controllers/galleryController');

//MIDDLEWARE FOR ROUTING
const router = express.Router();

router.route('/').get(controller.galleryFunc);
router.route('/:imageDetail').get(controller.imageDetailFunc);
router.route('/delete/:imageToDelete').post(controller.deleteImage);
router.route('/showNext/:imageToShow').post(controller.showImageOnFrame);

module.exports = router;