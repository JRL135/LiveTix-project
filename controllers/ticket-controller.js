const QRCode = require('qrcode');
const Ticket = require('../models/ticket-model');
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const initVector = crypto.randomBytes(16);
const securityKey = crypto.randomBytes(32);
require('dotenv').config();
const AWS = require('aws-sdk');
AWS.config.update({region: process.env.AWS_REGION});


async function getTicketDetails(req, res, next){
    console.log("getTicketDetails triggered");
    try {
        let ticket_id = req.params.id;
        console.log(ticket_id);
        let ticketDetails = await Ticket.getTicketDetails(ticket_id);
        console.log(ticketDetails);
        let eventDetailsForTicket = await Ticket.getEventDetailsForTicket(ticket_id);
        console.log(eventDetailsForTicket);
        let arrayObj = {};
        // for (let i = 0; i < .length; i++) {}
        arrayObj.title = eventDetailsForTicket[0].title;
        arrayObj.city = eventDetailsForTicket[0].city;
        arrayObj.avenue = eventDetailsForTicket[0].avenue;
        arrayObj.date = eventDetailsForTicket[0].start_date;
        arrayObj.ticket_price = ticketDetails[0].price;
        arrayObj.ticket_type = ticketDetails[0].type_name;
        arrayObj.qrcode = ticketDetails[0].qrcode;
        req.result = arrayObj;
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

async function genQRcode(ticket_ids){
    console.log("genQRcode triggered");
    // gen url hash for each ticket
    // gen qrcode on the hash for each ticket
    // save them into db
    for (let i = 0; i < ticket_ids.length; i++) {
        let ticket_id = ticket_ids[i];
        //gen QRcode
        // http://localhost:80/ticket/jiwoijgirowiogjireo

        // const generateHash = new RandomHash({
        //     length: 7,
        //     charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_+',
        //     rng: randomBytes
        // });
        // let ticketURLHash = generateHash();
        let ticketURLHash = await encryptTicketURL(ticket_id);
        let ticketURL = `http://54.214.232.77/ticket/${ticketURLHash}`;
        let ticketQR = await QRCode.toDataURL(ticketURL); //qrcode
        // console.log(ticketQR);
        //link qrcode with ticket_id, save into DB
        await Ticket.saveTicketURLAndQR(ticketURL, ticketQR, ticket_id);
    }
    
}

async function s3UploadQR(ticketQR, ticket_id){
    // Configure AWS with your access and secret key.
    const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET_NAME } = process.env;
    // Configure AWS to use promise
    // AWS.config.setPromisesDependency(require('bluebird'));
    AWS.config.update({ accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY, region: AWS_REGION });
    // Create an s3 instance
    const s3 = new AWS.S3();
    // Getting the file type, ie: jpeg, png or gif
    const type = ticketQR.split(';')[0].split('/')[1];
    // With this setup, each time your user uploads an image, will be overwritten.
    // To prevent this, use a different Key each time.
    // This won't be needed if they're uploading their avatar, hence the filename, userAvatar.js.
    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: `ticketQR/${ticket_id}.${type}`, // type is not required
      Body: ticketQR,
    //   ACL: 'public-read',
      ContentEncoding: 'base64', // required
      ContentType: `image/${type}` // required. Notice the back ticks
    }
  
    // The upload() is used instead of putObject() as we'd need the location url and assign that to our user profile/database
    // see: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
    let location = '';
    let key = '';
    try {
      const { Location, Key } = await s3.upload(params).promise();
      location = Location;
      key = Key;
    } catch (error) {
       console.log(error);
    }
    
    // Save the Location (url) to your database and Key if needs be.
    // As good developers, we should return the url and let other function do the saving to database etc
    console.log(location, key);
    
    return location;
    
    // To delete, see: https://gist.github.com/SylarRuby/b3b1430ca633bc5ffec29bbcdac2bd52
}


function encryptTicketURL(ticket_id){
    console.log("encryptTicketURL triggered");
    console.log(ticket_id);
    console.log(typeof(ticket_id));
    let ticket_id_string = toString(ticket_id);
    const cipher = crypto.createCipheriv(algorithm, securityKey, initVector);
    let encryptedData = cipher.update(ticket_id_string, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    console.log(encryptedData);
    return encryptedData;
}
function decryptTicketURL(ticketURLHash){
    const decipher = crypto.createDecipheriv(algorithm, securityKey, initVector);
    let decryptedData_string = decipher.update(ticketURLHash, "hex", "utf-8");
    decryptedData_string += decipher.final("utf8");
    let decryptedData = parseInt(decryptedData_string);
    console.log(decryptedData);
    return decryptedData;
}

async function authTicket(req, res, next){
    console.log('authTicket triggered');
    //check req.result
    //if admin, check ticket status
    let message;
    req.result = admin; // TEMP! REMOVE LATER
    if (req.result !== 'admin') {
        message = "not admin";
    } else { //check ticket status
        // scan qrcode
        // qrcode should lead to ticket url
        // ticket url decoded 
        await decryptTicketURL(ticketURLHash);
        let ticketDetails = await Ticket.getTicketDetails(ticket_id);
        if (ticketDetails[0].used_status === 0) {
            await Ticket.updateUsed(ticket_id);
            message = "ticket authenticated";
        } else {
            message = "invalid ticket";
        }
    }
    req.result = message;
    await next();
}

module.exports = { getTicketDetails, genQRcode, authTicket };