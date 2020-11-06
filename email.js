var imaps = require('imap-simple');
var fs = require('fs');
var commonFunctions = require('./commonFunctions');
var path = require('path');

var config = {
    imap: {
       user: '****',
       password: '*****',
       host: 'imap.gmail.com',
       port: 993,
       tls: true,
       authTimeout: 3000,
       tlsOptions: { rejectUnauthorized: false } 
    }
}

exports.checkInbox = () => {imaps.connect(config).then(function (connection) {
 
    connection.openBox('INBOX').then(function () {
 
        // Fetch emails from the last 24h
        var searchCriteria = ['UNSEEN', ['OR',['OR',['HEADER','SUBJECT', 'Photos'],['HEADER','SUBJECT', 'Photo']],['OR',['HEADER','SUBJECT', 'photos'],['HEADER','SUBJECT', 'photo']]]];
        var fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true };
 
        // retrieve only the headers of the messages
        return connection.search(searchCriteria, fetchOptions);
    }).then(function (messages) {

        console.log(messages);
 
        var attachments = [];
 
        messages.forEach(function (message) {

            connection.addFlags(message.attributes.uid, "\SEEN", (err) => {
                if (err) {
                    console.log("error marking as read");
                }
            })

            var parts = imaps.getParts(message.attributes.struct);
            attachments = attachments.concat(parts.filter(function (part) {
                return part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT';
            }).map(function (part) {
                // retrieve the attachments only of the messages with attachments
                return connection.getPartData(message, part)
                    .then(function (partData) {
                        console.log("Does this tell me file type?");
                        console.log(part.disposition.params);
                        return {
                            filename: part.disposition.params.filename,
                            data: partData
                        };
                    });
            }));
            
        });
 
        return Promise.all(attachments);
    }).then(function (attachments) {
        try{
            if (attachments.length === 0){ 
                console.log("No attachments");
            } else {
                console.log("attachents");
            }

            const newImages = [];

            attachments.forEach(function (element){
                let filename = element.filename;
                //check if the file is of type JPEG
                let pos = filename.indexOf("."); 
                let fileType = filename.substring(pos + 1, filename.length);
                fileType = fileType.toUpperCase();
                if (fileType === "JPEG" || fileType === "JPG"){
                //if attachment file is a jpg or jpeg then process and download
                    console.log("Right file type");
                    const imageFolder = commonFunctions.getImageFolderPath();
                    const imageThumbnailFolder = commonFunctions.getThumbnailImageFolderPath();
                    //get the correct new name for the email attachment
                    //calculate new name
                    const newFileName = commonFunctions.newFileName();
                    //save the file
                    fs.writeFileSync(`${path.join(imageFolder,newFileName)}`, element.data);
                    //Create the new thumbnail
                    commonFunctions.writeThumbnail(newFileName, imageFolder, imageThumbnailFolder);
    
                    //if there are multiple images to be added to the photolist want to do it
                    //all at once otherwise on each insert the list is randomised so they dont
                    //appear in sequence when you they are first sent
                    newImages.push(newFileName);
                    
                } else {
                    //if not the right file type more on to need attachment
                    console.log("Not the right file type");
                }

            });

            //add attachment images to photolist
            if (newImages.length !== 0){ 
                newImages.forEach((element) => {
                    commonFunctions.insertNewImage(element);
                });
            }

            //close connection to mailbox
            connection.closeBox((err) => {
                if (err){
                    console.log("Cant close inbox");
                }
            });
            connection.end();
        } catch (err){
            console.log(err);
        }

        console.log("At the end of email code");
    });
})};