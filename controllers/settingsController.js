const fs = require('fs');
const commonFunctions = require('./../commonFunctions');

exports.renderSettings = (req, res) => {
    const currentSettings = readCurrentSettingSYNC();
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
    if (interval === undefined || order === undefined) {
        //error read in the setting data again 
        const currentSettings = readCurrentSettingSYNC();
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
    const savedObject = saveSettingsSYNC(intervalNumber, order);
    
    res.status(200).render('settings', { 
        saveStatus: "True",
        currentInterval: `${savedObject.interval}`,
        currentOrder: `${savedObject.photoOrder}`
    });

};

const saveSettingsSYNC = (interval, photoOrder) => {
    //construct a JSON object
    //Save the JSON object to a file
    const settings = {
        interval: interval,
        photoOrder: photoOrder
    };
    const settingsJSON = JSON.stringify(settings);
    fs.writeFileSync(commonFunctions.getSettingsLocation(), settingsJSON, 'utf8');
    return settings;
};

const readCurrentSettingSYNC = () => {
    const settingsFile = fs.readFileSync(commonFunctions.getSettingsLocation(), 'utf8');
    return JSON.parse(settingsFile);
};