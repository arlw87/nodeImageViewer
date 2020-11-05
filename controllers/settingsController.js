const fs = require('fs');
const commonFunctions = require('./../commonFunctions');

exports.renderSettings = (req, res) => {
    const currentSettings = commonFunctions.readCurrentSettingSYNC();
    console.log(currentSettings);
    res.status(200).render('settings', { 
        saveStatus: "False",
        currentInterval: `${currentSettings.interval}`,
        currentOrder: `${currentSettings.photoOrder}`
    });
};

exports.saveSettings = (req, res) => {
    const interval = req.body.interval;
    const order = req.body.photoOrder;
    console.log(order);
    console.log(`interval is ${interval}`);

    const currentSettings = commonFunctions.readCurrentSettingSYNC();
    if (interval === undefined || order === undefined) {
        //error read in the setting data again 
        //output an error page
        res.status(200).render('settings', { 
            saveStatus: "Error",
            currentInterval: `${currentSettings.interval}`,
            currentOrder: `${currentSettings.photoOrder}`
        })
        return
    }

    //convert to number
    var intervalNumber = interval * 1;
    const savedObject = commonFunctions.saveSettingsSYNC(intervalNumber, order);
    console.log(savedObject);

    //has the photo order been updated
    //current Settings read from settings file Vs settings from webpage
    if (currentSettings.photoOrder !== order){
        console.log(`Photo order has changed from ${currentSettings.photoOrder} to ${order}`);
        //set the photo order of the photoframe from the settings in the file
        commonFunctions.setPhotoOrder();
        //generate a new list as the order has changed
        commonFunctions.generateNewPhotoList();
    }
    
    res.status(200).render('settings', { 
        saveStatus: "True",
        currentInterval: `${savedObject.interval}`,
        currentOrder: `${savedObject.photoOrder}`
    });

};

