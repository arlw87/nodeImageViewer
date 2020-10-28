const express = require('express');
const router = express.Router();
const controller = require('./../controllers/settingsController');

router.route('/').get(controller.renderSettings);

module.exports = router;