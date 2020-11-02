const express = require('express');
const router = express.Router();
const controller = require('./../controllers/liveController');

router.route('/').get(controller.liveView);
router.route('/update').get(controller.update);

module.exports = router;