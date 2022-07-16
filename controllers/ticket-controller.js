/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
const QRCode = require('qrcode');
const Ticket = require('../models/ticket-model');
const AuthController = require('./auth-controller');
// const crypto = require('crypto');
const CryptoJS = require('crypto-js');

require('dotenv').config();
// const AWS = require('aws-sdk');
// AWS.config.update({region: process.env.AWS_REGION});


async function getTicketDetails(req, res, next) {
  console.log('getTicketDetails triggered');
  try {
    const ticketId = req.params.id;
    console.log(ticketId);
    const ticketDetails = await Ticket.getTicketDetails(ticketId);
    console.log(ticketDetails);
    req.result = ticketDetails;
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getUserUnusedTicketsForListing(req, res, next) {
  console.log('getUserUnusedTicketsForListing triggered');
  try {
    const userId = req.params.id;
    const unusedTickets = await Ticket.getUserUnusedTicketsForListing(userId);
    console.log(unusedTickets);
    req.result = unusedTickets;
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function genQRcode(ticketIds) {
  console.log('genQRcode triggered');
  // gen url hash for each ticket
  // gen qrcode on the hash for each ticket
  // save them into db
  for (let i = 0; i < ticketIds.length; i++) {
    const ticketId = ticketIds[i];

    // hashing ticket URL
    const ticketURLHash = await encryptTicketURL(ticketId);

    // now hash = ticket_id
    let ticketURL;
    if (process.env.MODE === 'development') {
      ticketURL = `${process.env.ROOT_URL}ticket/verification/${ticketURLHash}`;
    } else if (process.env.MODE === 'production') {
      ticketURL = `https://${process.env.DOMAIN}ticket/verification/${ticketURLHash}`;
    }
    console.log(ticketURL);

    // ticket URL to qrcode
    const ticketQR = await QRCode.toDataURL(ticketURL);
    console.log(ticketQR);

    // link qrcode with ticket_id, save into DB
    await Ticket.saveTicketURLAndQR(ticketURL, ticketQR, ticketId);
  }
}

async function s3UploadQR(ticketQR, ticketId) {
  // Configure AWS with your access and secret key.
  const {AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET_NAME} = process.env;
  // Configure AWS to use promise
  // AWS.config.setPromisesDependency(require('bluebird'));
  AWS.config.update({accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY, region: AWS_REGION});
  // Create an s3 instance
  const s3 = new AWS.S3();
  // Getting the file type, ie: jpeg, png or gif
  const type = ticketQR.split(';')[0].split('/')[1];
  // With this setup, each time your user uploads an image, will be overwritten.
  // To prevent this, use a different Key each time.
  // This won't be needed if they're uploading their avatar, hence the filename, userAvatar.js.
  const params = {
    Bucket: AWS_BUCKET_NAME,
    Key: `ticketQR/${ticketId}.${type}`, // type is not required
    Body: ticketQR,
    //   ACL: 'public-read',
    ContentEncoding: 'base64', // required
    ContentType: `image/${type}`, // required. Notice the back ticks
  };

  // The upload() is used instead of putObject() as we'd need the location url and assign that to our user profile/database
  // see: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
  let location = '';
  let key = '';
  try {
    const {Location, Key} = await s3.upload(params).promise();
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


const key = process.env.CRYPTOKEY;

function encryptTicketURL(ticketId) {
  console.log('encryptTicketURL triggered');
  console.log(ticketId);
  console.log(typeof(ticketId));
  ticketId = ticketId.toString();
  const ciphertext = CryptoJS.AES.encrypt(ticketId, key).toString();
  const ciphertextURLencoded = encodeURIComponent(ciphertext);
  console.log(ciphertextURLencoded);
  return ciphertextURLencoded;
}

// const algorithm = 'aes-256-ctr';
// const initVector = crypto.randomBytes(16);
// const securityKey = crypto.randomBytes(32);

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

function decryptTicketURL(ticketURLHash) {
  console.log('decryptTicketURL triggered');
  console.log(ticketURLHash);
  console.log(typeof(ticketURLHash));
  const ticketURLHashDecoded = decodeURIComponent(ticketURLHash);
  console.log(ticketURLHashDecoded);
  const ciphertext = CryptoJS.AES.decrypt(ticketURLHashDecoded, key).toString(CryptoJS.enc.Utf8);
  console.log('ciphertext:');
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

async function authTicket(req, res, next) {
  console.log('authTicket triggered');
  // scan qrcode -> call veritifcation api
  // check req.result
  // if admin, check ticket status
  const userInfo = await AuthController.checkUserRole(req);
  console.log(userInfo);
  const adminId = userInfo.user_id;
  let message;
  if (userInfo.role !== 'admin') {
    message = 'not admin';
  } else { // check ticket status
    // decode ticket url to get ticket_id
    const ticketURLHash = encodeURIComponent(req.params.hash);
    console.log('ticketURLHash: ' + ticketURLHash);
    const ticketId = await decryptTicketURL(ticketURLHash);

    console.log('ticket_id: ' + ticketId);

    // check if ticket has already been verified
    // only qrcode currently saved in db is valid (to account for exchanged condition)
    const ticketDetails = await Ticket.getTicketDetails(ticketId);
    let reqTicketUrl;
    if (process.env.MODE === 'development') {
      reqTicketUrl = `${process.env.ROOT_URL}ticket/verification/${ticketURLHash}`;
    } else if (process.env.MODE === 'production') {
      reqTicketUrl = `https://${process.env.DOMAIN}ticket/verification/${ticketURLHash}`;
    }
    if (ticketDetails[0].used_status === 0 && ticketDetails[0].ticket_url === reqTicketUrl) {
      await Ticket.updateUsed(ticketId, adminId);
      message = {
        status: 1,
        message: `Ticket number ${ticketId} authenticated`,
      };
    } else if (ticketDetails[0].used_status === 0 && ticketDetails[0].ticket_url != reqTicketUrl) {
      message = {
        status: 0,
        message: `Invalid ticket QRcode`,
      };
    } else {
      message = {
        status: 0,
        message: `Ticket number ${ticketId} has already been verified`,
      };
    }
  }
  req.result = message;
  await next();
}

async function getVerifiedTickets(req, res, next) {
  console.log('getVerifiedTickets triggered');
  try {
    const adminId = req.params.id;
    const verifiedTickets = await Ticket.getVerifiedTickets(adminId);
    console.log(verifiedTickets);
    req.result = verifiedTickets;
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getSelectedEventTicketTypes(req, res, next) {
  console.log('getVerifiedTickets triggered');
  try {
    const eventId = req.params.id;
    const ticketTypes = await Ticket.getSelectedEventTicketTypes(eventId);
    console.log(ticketTypes);
    req.result = ticketTypes;
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function postExchangeCondition(req, res, next) {
  console.log('postExchangeCondition triggered');
  try {
    console.log(req.body);
    const userId = req.body.user_id;
    const ticketId = parseInt(req.body.ticket_id);
    const selectedEventId = parseInt(req.body.selected_event_id);
    const selectedTicketType = req.body.selected_ticket_type;
    const listingId = await Ticket.saveExchangeAndListing(selectedEventId, selectedTicketType, userId, ticketId);
    console.log('listingId: ' + listingId);
    if (listingId != undefined) {
      req.result = {
        status: 'success',
        listing_id: listingId,
      };
    } else {
      req.result = {
        status: 'failure',
      };
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getAllCurrentListings(req, res, next) {
  console.log('getCurrentListings triggered');
  try {
    const userInfo = await AuthController.checkUserRole(req);
    const userId = userInfo.user_id;
    const listings = await Ticket.getAllCurrentListings(userId);
    console.log(listings);
    req.result = listings;
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getUserCurrentListings(req, res, next) {
  console.log('getCurrentListings triggered');
  try {
    const userId = req.params.id;
    const listings = await Ticket.getUserCurrentListings(userId);
    console.log(listings);
    req.result = listings;
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function postListingSelection(req, res, next) {
  console.log('postListingSelection triggered');
  try {
    // check if user_id has ticket that meets listing_id requirement
    const user_id = parseInt(req.body.user_id);
    const listing_selection_id = parseInt(req.body.listing_selection_id);
    console.log('user_id: ' + user_id);
    console.log('listing_selection_id: ' + listing_selection_id);

    const userMatchingTickets = await Ticket.getUserMatchingTicketsForExchange(user_id, listing_selection_id);
    console.log('userMatchingTickets:');
    console.log(userMatchingTickets);
    const matchingTixLength = userMatchingTickets.length;
    if (userMatchingTickets.length > 0) {
      console.log(`${matchingTixLength} matching ticket(s) detected`);

      // update user_id, ticket_url, qrcode
      // need matched user_ids & ticket_ids
      // user_id = i have user_id
      // poster user_id (i want user_id)
      // ticket_id = i have ticket_id
      // poster ticket_id (i want ticket_id)
      const ticket_id = userMatchingTickets[0].ticket_id;
      console.log('ticket_id: ' + ticket_id);
      const poster_user_id = userMatchingTickets[0].poster_user_id;
      console.log('poster_user_id: ' + poster_user_id);
      const poster_ticket_id = userMatchingTickets[0].poster_ticket_id;
      console.log('poster_ticket_id: ' + poster_ticket_id);

      const ticketURLHash = await encryptTicketURL(ticket_id);
      let ticketURL;
      if (process.env.MODE === 'development') {
        ticketURL = `${process.env.ROOT_URL}ticket/verification/${ticketURLHash}`;
      } else if (process.env.MODE === 'production') {
        ticketURL = `https://${process.env.DOMAIN}ticket/verification/${ticketURLHash}`;
      }
      const ticketQR = await QRCode.toDataURL(ticketURL);
      const poster_ticketURLHash = await encryptTicketURL(poster_ticket_id);
      let poster_ticketURL;
      if (process.env.MODE === 'development') {
        poster_ticketURL = `http://localhost:80/ticket/verification/${poster_ticketURLHash}`;
      } else if (process.env.MODE === 'production') {
        poster_ticketURL = `https://${process.env.DOMAIN}ticket/verification/${poster_ticketURLHash}`;
      }
      const poster_ticketQR = await QRCode.toDataURL(poster_ticketURL);
      const exchangeResult = await Ticket.executeExchange(user_id, ticket_id, ticketURL, ticketQR, poster_user_id, poster_ticket_id, poster_ticketURL, poster_ticketQR);
      if (exchangeResult.length == 0 || exchangeResult == null || exchangeResult == undefined) {
        console.log('exchange db error');
        return res.status(500).send({
          message: 'Something went wrong during the exchange, please try again',
        });
      } else {
        console.log('exchange completed, returning exchange ticket ids to users');
        // return exchanged ticket ids to users
        // current_user:
        req.result = {
          status: 1,
          new_ticket_id: poster_ticket_id,
          message: `Congratulations! Your new ticket ID is ${poster_ticket_id}`,
        };
        // poster_user: send message to poster_user
        // ticket_id
        const poster_message = `Congratulations, your marketplace listing #${listing_selection_id} was successfully exchanged. Your new ticket ID is ${ticket_id}.`;
        const poster_message_query = await Ticket.sendMessage(poster_user_id, poster_message);
        // current_user: send message to current_user
        const message = `Congratulations, you have successfully exchanged your ticket #${ticket_id} for ticket #${poster_ticket_id}.`;
        const message_query = await Ticket.sendMessage(user_id, message);
      }
    } else {
      console.log('no matching tickets');
      req.result = {
        status: 0,
        message: `Exchange was unsuccessful, please try again later.`,
      };
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

module.exports = {getTicketDetails, getUserUnusedTicketsForListing, genQRcode, authTicket, getVerifiedTickets, getSelectedEventTicketTypes, postExchangeCondition, getAllCurrentListings, getUserCurrentListings, postListingSelection};
