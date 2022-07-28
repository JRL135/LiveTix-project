/* eslint-disable prefer-const */
const QRCode = require('qrcode');
const Ticket = require('../models/ticket-model');
const Auth = require('../utils/auth');
const CryptoJS = require('crypto-js');
const key = process.env.CRYPTOKEY;
require('dotenv').config();


// save user_id, timer_timestamp
async function reserveTickets(req, res, next) {
  console.log('reserveTickets triggered');
  try {
    if (req.result == 'No token') {
      console.log(req.result + ', calling next');
      next();
    } else {
      console.log(req.result);
      const userId = req.result.user_id;
      console.log('userId: ' + userId);
      // get ticket_type, ticket_number
      const tickets = req.body;
      console.log('------------------');
      console.log(tickets);
      const eventId = req.body.event_id;

      const ticketNumberArray = [];
      const ticketTypeNameArray = [];
      for (let i = 0; i < tickets.ticket_number.length; i++) {
        const ticketNumber = parseInt(tickets.ticket_number[i]);
        const ticketTypeName = tickets.ticket_type[i];
        ticketNumberArray.push(ticketNumber);
        ticketTypeNameArray.push(ticketTypeName);
      }
      // 1. check available tickets for each ticket type, grab ticket ids
      const ticIds = await Ticket.checkAndReserveTickets(eventId, userId, ticketTypeNameArray, ticketNumberArray);
      console.log('--------BACK IN CONTROLLER--------');
      console.log(ticIds);
      if (ticIds.length != 0) {
        // 2. grab reserved tickets info for frontend render
        const reservedTicketsInfo = await Ticket.getReservedTicketsType(ticIds);
        console.log(reservedTicketsInfo);
        // json:
        // [
        //   { type: 'zone_A', type_name: 'Zone A', number: 1 },
        //   { type: 'zone_B', type_name: 'Zone B', number: 2 }
        // ]

        // if all ticket types have available tickets
        console.log('reserved tickets array: ');
        console.log(reservedTicketsInfo);
        console.log('sending reserved tickets array to frontend');
        // 3. send tickets to frontend
        req.result = {
          status: 1,
          result: reservedTicketsInfo,
        };
      } else {
        console.log('no available tickets for reserve');
        req.result = {
          status: 0,
          message: 'Sorry, there are no available tickets at the moment.',
        };
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function saveTicketOrder(req, res, next) {
  console.log('saveTicketOrder triggered');
  const eventId = req.params.id;
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  const userInfo = await Auth.checkToken(token);
  console.log('userInfo:');
  console.log(userInfo);
  const userId = userInfo.id;
  console.log('userId: ' + userId);
  // order: event_id, user_id
  // ticket: user_id, purchase_date
  // insert ticket_order table
  const buyTicketsArray = req.body;
  console.log('buyTicketsArray in saveTicketOrder:');
  console.log(buyTicketsArray);

  try {
    // check timer status
    const statusOkArray = await Ticket.checkTimerStatus(eventId, userId, buyTicketsArray);
    console.log('------------timer check ok tix array: ------------');
    console.log(statusOkArray);
    // const tixOkArray = [];
    // for (let i = 0; i < status.length; i++) {
    //   console.log(Object.keys(status[i]));
    //   if (Object.keys(status[i])[0] === 'ok') {
    //     tixOkArray.push(Object.values(status[i])[0]);
    //   }
    // }
    // console.log('------printing tixOkArray: ');
    // console.log(tixOkArray);
    if (statusOkArray.length != 0) {
      await genQRcode(statusOkArray);
      const orderId = await Ticket.saveTicketOrder(eventId, userId, statusOkArray);
      console.log(orderId);
      req.order_result = orderId;
    } else {
      console.log('some tickets have expired timer, returning expired ticket_ids to frontend');
      req.anti_order_result = 0;
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

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

async function authTicket(req, res, next) {
  console.log('authTicket triggered');
  // scan qrcode -> call veritifcation api
  // check req.result
  // if admin, check ticket status
  const userInfo = await Auth.checkUserRole(req);
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

    console.log('ticketId: ' + ticketId);

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
  console.log('getSelectedEventTicketTypes triggered');
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
  console.log('getAllCurrentListings triggered');
  try {
    const userInfo = await Auth.checkUserRole(req);
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
  console.log('getUserCurrentListings triggered');
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
    const userId = parseInt(req.body.user_id);
    const listingSelectionId = parseInt(req.body.listing_selection_id);
    console.log('userId: ' + userId);
    console.log('listingSelectionId: ' + listingSelectionId);

    const userMatchingTickets = await Ticket.getUserMatchingTicketsForExchange(userId, listingSelectionId);
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
      const ticketId = userMatchingTickets[0].ticket_id;
      console.log('ticketId: ' + ticketId);
      const posterUserId = userMatchingTickets[0].poster_user_id;
      console.log('posterUserId: ' + posterUserId);
      const posterTicketId = userMatchingTickets[0].poster_ticket_id;
      console.log('posterTicketId: ' + posterTicketId);

      const ticketURLHash = await encryptTicketURL(ticketId);
      let ticketURL;
      if (process.env.MODE === 'development') {
        ticketURL = `${process.env.ROOT_URL}ticket/verification/${ticketURLHash}`;
      } else if (process.env.MODE === 'production') {
        ticketURL = `https://${process.env.DOMAIN}ticket/verification/${ticketURLHash}`;
      }
      const ticketQR = await QRCode.toDataURL(ticketURL);
      const posterTicketURLHash = await encryptTicketURL(posterTicketId);
      let posterTicketURL;
      if (process.env.MODE === 'development') {
        posterTicketURL = `http://localhost:80/ticket/verification/${posterTicketURLHash}`;
      } else if (process.env.MODE === 'production') {
        posterTicketURL = `https://${process.env.DOMAIN}ticket/verification/${posterTicketURLHash}`;
      }
      const posterTicketQR = await QRCode.toDataURL(posterTicketURL);
      const exchangeResult = await Ticket.executeExchange(userId, ticketId, ticketURL, ticketQR, posterUserId, posterTicketId, posterTicketURL, posterTicketQR);
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
          new_ticket_id: posterTicketId,
          message: `Congratulations! Your new ticket ID is ${posterTicketId}`,
        };
        // poster_user: send message to poster_user
        // ticket_id
        const posterMessage = `Congratulations, your marketplace listing #${listingSelectionId} was successfully exchanged. Your new ticket ID is ${ticketId}.`;
        const posterMessageQuery = await Ticket.sendMessage(posterUserId, posterMessage);
        // current_user: send message to current_user
        const message = `Congratulations, you have successfully exchanged your ticket #${ticketId} for ticket #${posterTicketId}.`;
        const messageQuery = await Ticket.sendMessage(userId, message);
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

module.exports = {reserveTickets, saveTicketOrder, getTicketDetails, getUserUnusedTicketsForListing, genQRcode, authTicket, getVerifiedTickets, getSelectedEventTicketTypes, postExchangeCondition, getAllCurrentListings, getUserCurrentListings, postListingSelection};
