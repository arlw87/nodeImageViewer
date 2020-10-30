const express = require('express');
const router = express.Router();
const controller = require('./../controllers/liveController');

router.route('/').get(controller.liveView);

module.exports = router;