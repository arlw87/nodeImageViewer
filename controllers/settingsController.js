const fs = require('fs');
const shell = require('shelljs');
const commonFunctions = require('./../commonFunctions');

exports.renderSettings = (req, res) => {
    const currentSettings = commonFunctions.readCurrentSettingSYNC();
    console.log(currentSettings);
    console.log(` shutdown time ${currentSettings.shutdownTime}`);
    res.status(200).render('settings', { 
        status: "False",
        currentInterval: `${currentSettings.interval}`,
        currentOrder: `${currentSettings.photoOrder}`,
        currentShutdownOption: `${currentSettings.shutdownOption}`,
        currentShutdownTime: `${currentSettings.shutdownTime}` 
    });
};

exports.saveSettings = (req, res) => {
    const interval = req.body.interval;
    const order = req.body.photoOrder;
    const shutdownTime = req.body.shutdownTime;
    const shutdownOption = req.body.shutdownOption;

    const currentSettings = commonFunctions.readCurrentSettingSYNC();
    if (interval === undefined || order === undefined || shutdownOption === undefined) {
        //error read in the setting data again 
        //output an error page
        res.status(200).render('settings', { 
            status: "Error",
            currentInterval: `${currentSettings.interval}`,
            currentOrder: `${currentSettings.photoOrder}`,
            currentShutdownOption: `${currentSettings.shutdownOption}`,
            currentShutdownTime: `${currentSettings.shutdownTime}` 
        })
        return
    }

    //if shutdown is enabled but no time set
    if ((shutdownOption === "enabled" && ( shutdownTime === undefined || shutdownTime.length === 0))){
        //error read in the setting data again 
        //output an error page
        res.status(200).render('settings', { 
            status: "timeError",
            currentInterval: `${currentSettings.interval}`,
            currentOrder: `${currentSettings.photoOrder}`,
            currentShutdownOption: `${currentSettings.shutdownOption}`,
            currentShutdownTime: `${currentSettings.shutdownTime}` 
        })
        return
    }

    console.log(`The time output ${shutdownTime} and shutdown option ${shutdownOption}`);

    //convert to number
    var intervalNumber = interval * 1;
    const savedObject = commonFunctions.saveSettingsSYNC(intervalNumber, order, shutdownOption, shutdownTime);
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
    
    console.log(currentSettings);
    console.log(` shutdown Options ${savedObject.shutdownOption}`);

    res.status(200).render('settings', { 
        status: "True",
        currentInterval: `${savedObject.interval}`,
        currentOrder: `${savedObject.photoOrder}`,
        currentShutdownOption: `${savedObject.shutdownOption}`,
        currentShutdownTime: `${savedObject.shutdownTime}` 
    });

};

exports.reboot = (req, res) => {
    const currentSettings = commonFunctions.readCurrentSettingSYNC();
    console.log(currentSettings);
    res.status(200).render('settings', { 
        status: "Rebooting.....",
        currentInterval: `${currentSettings.interval}`,
        currentOrder: `${currentSettings.photoOrder}`,
        currentShutdownOption: `${currentSettings.shutdownOption}`,
        currentShutdownTime: `${currentSettings.shutdwonTime}` 
    });
    shell.exec("sudo reboot now");
    shell.echo("Rebooting.....");    
}

const renderSettingsPage = (req, res, settingsObj, statusMessage) => {
    res.status(200).render('settings', { 
        status: statusMessage,
        currentInterval: `${settingsObj.interval}`,
        currentOrder: `${settingsObj.photoOrder}`,
        currentShutdownOption: `${settingsObj.shutdownOption}`,
        currentShutdownTime: `${settingsObj.shutdwonTime}` 
    });
}

