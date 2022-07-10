const QRCode = require('qrcode');
const Ticket = require('../models/ticket-model');
const AuthController = require('./auth-controller');
const crypto = require('crypto');
const CryptoJS = require('crypto-js');

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
        req.result = ticketDetails;
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

async function getUserUnusedTickets(req, res, next){
    console.log("getUserUnusedTickets triggered");
    try {
        let user_id = req.params.id;
        let unusedTickets = await Ticket.getUserUnusedTickets(user_id);
        console.log(unusedTickets);
        req.result = unusedTickets;

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

        //TEMP
        // let ticketURLHash = ticket_id + 'xgJdHeKyh7vVWieommnq2rOPcVmS';

        // hashing ticket URL
        let ticketURLHash = await encryptTicketURL(ticket_id);
        // now hash = ticket_id
        let ticketURL = `http://localhost:80/ticket/verification/${ticketURLHash}`;
        // let ticketURL = `https://${process.env.DOMAIN}ticket/verification/${ticketURLHash}`;
        console.log(ticketURL);

        // ticket URL to qrcode
        let ticketQR = await QRCode.toDataURL(ticketURL); 
        console.log(ticketQR);

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

const algorithm = 'aes-256-ctr';
const initVector = crypto.randomBytes(16);
// const securityKey = crypto.randomBytes(32);
const key = process.env.CRYPTOKEY;


function encryptTicketURL(ticket_id){
    console.log("encryptTicketURL triggered");
    console.log(ticket_id);
    console.log(typeof(ticket_id));
    ticket_id = ticket_id.toString();
    let ciphertext = CryptoJS.AES.encrypt(ticket_id, key).toString();
    let ciphertext_URLencoded = encodeURIComponent(ciphertext);
    console.log(ciphertext_URLencoded);
    return ciphertext_URLencoded;
}

// function encryptTicketURL(ticket_id){
//     let newsha256 = crypto.createHash("sha256")
//     newsha256.update("abc");
//     console.log("encryptTicketURL triggered");
//     console.log(ticket_id);
//     console.log(typeof(ticket_id));
//     let ticket_id_string = toString(ticket_id);
//     const cipher = crypto.createCipheriv(algorithm, newsha256.digest(), initVector);
//     let encryptedData = cipher.update(Buffer.from(ticket_id_string));
//     let encryptedData1 = Buffer.concat([initVector, encryptedData, cipher.final()]);
//     encryptedData1 = encryptedData1.toString('Base64');
//     console.log("----------------------------------");
//     console.log(encryptedData1);
//     let ciphertext_URLencoded = encodeURIComponent(encryptedData1);
//     console.log(ciphertext_URLencoded);
//     return ciphertext_URLencoded;
// }

function decryptTicketURL(ticketURLHash){
    console.log("decryptTicketURL triggered");
    console.log(ticketURLHash);
    console.log(typeof(ticketURLHash));
    let ticketURLHash_decoded = decodeURIComponent(ticketURLHash);
    console.log(ticketURLHash_decoded);
    let ciphertext = CryptoJS.AES.decrypt(ticketURLHash_decoded, key).toString(CryptoJS.enc.Utf8);
    console.log("ciphertext:");
    console.log(ciphertext);
    return ciphertext;
}

// function decryptTicketURL(ticketURLHash){
//     let newsha256 = crypto.createHash("sha256")
//     newsha256.update("abc");
//     let ticketURLHash_decoded = decodeURIComponent(ticketURLHash);
//     console.log('==========================');
//     console.log(ticketURLHash_decoded);
//     let input = Buffer.from(ticketURLHash_decoded, "base64")
//     let decIV = input.slice(0, 16);
//     const decipher = crypto.createDecipheriv(algorithm, newsha256.digest(), decIV);


//     let toDecipherBuffer = input.slice(16)
//     let decipherText = decipher.update(toDecipherBuffer) + decipher.final();
//     console.log(decipherText);
//     console.log(decipherText.toString('base64'))


//     // let decryptedData_string = decipher.update(ticketURLHash, "hex", "utf-8");
//     // decryptedData_string += decipher.final("utf8");
//     // let decryptedData = parseInt(decryptedData_string);
//     // console.log(decryptedData);
//     // return decryptedData;
//     return decipherText
// }

async function authTicket(req, res, next){
    console.log('authTicket triggered');
    // scan qrcode -> call veritifcation api
    // check req.result
    // if admin, check ticket status
    let userInfo = await AuthController.checkUserRole(req);
    console.log(userInfo);
    let message;
    if (userInfo.role !== 'admin') {
        message = "not admin";
    } else { //check ticket status

        // decode ticket url to get ticket_id
        let ticketURLHash = encodeURIComponent(req.params.hash);
        console.log("ticketURLHash: " + ticketURLHash);
        let ticket_id = await decryptTicketURL(ticketURLHash);

        console.log("ticket_id: " + ticket_id);

        // check if ticket has already been verified
        let ticketDetails = await Ticket.getTicketDetails(ticket_id);
        if (ticketDetails[0].used_status === 0) {
            await Ticket.updateUsed(ticket_id);
            message = `Ticket number ${ticket_id} authenticated`;
        } else {
            message = `Ticket number ${ticket_id} has already been verified`;
        }
    }
    req.result = message;
    await next();
}

async function getVerifiedTickets(req, res, next){
    console.log('getVerifiedTickets triggered');
    try {
        let admin_id = req.params.id;
        let verifiedTickets = await Ticket.getVerifiedTickets(admin_id);
        console.log(verifiedTickets);
        req.result = verifiedTickets;        
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

async function getSelectedEventTicketTypes(req, res, next){
    console.log('getVerifiedTickets triggered');
    try {
        let event_id = req.params.id;
        let ticketTypes = await Ticket.getSelectedEventTicketTypes(event_id);
        console.log(ticketTypes);
        req.result = ticketTypes;        
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

async function postExchangeCondition(req, res, next){
    console.log('postExchangeCondition triggered');
    try {
        console.log(req.body);
        let user_id = req.body.user_id;
        let ticket_id = parseInt(req.body.ticket_id);
        let selected_event_id = parseInt(req.body.selected_event_id);
        let selected_ticket_type = req.body.selected_ticket_type;
        let listing_id = await Ticket.saveExchangeAndListing(selected_event_id, selected_ticket_type, user_id, ticket_id);
        console.log(listing_id);
        req.result = {
            status: 'success',
            listing_id: listing_id
        };
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

async function getCurrentListings(req, res, next){
    console.log('getCurrentListings triggered');
    try {
        let listings = await Ticket.getCurrentListings();
        console.log(listings);
        req.result = listings;
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}


module.exports = { getTicketDetails, getUserUnusedTickets, genQRcode, authTicket, getVerifiedTickets, getSelectedEventTicketTypes, postExchangeCondition, getCurrentListings };