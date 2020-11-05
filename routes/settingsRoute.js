const express = require('express');
const router = express.Router();
const controller = require('./../controllers/settingsController');

router.use(express.urlencoded({
    extended: true
}));

router.route('/').get(controller.renderSettings).post(controller.saveSettings);
router.route('/reboot').post(controller.reboot);

module.exports = router;