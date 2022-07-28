/* eslint-disable prefer-const */
const QRCode = require('qrcode');
const Ticket = require('../models/ticket-model');
const Auth = require('../utils/auth');
const CryptoJS = require('crypto-js');
const key = process.env.CRYPTOKEY;
require('dotenv').config();


// save user_id, timer_timestamp
async function reserveTickets(req, res, next) {
  try {
    if (req.result == 'No token') {
      next();
    } else {
      const userId = req.result.user_id;
      // get ticket_type, ticket_number
      const tickets = req.body;
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
      if (ticIds.length != 0) {
        // 2. grab reserved tickets info for frontend render
        const reservedTicketsInfo = await Ticket.getReservedTicketsType(ticIds);
        // json:
        // [
        //   { type: 'zone_A', type_name: 'Zone A', number: 1 },
        //   { type: 'zone_B', type_name: 'Zone B', number: 2 }
        // ]

        // if all ticket types have available tickets
        // 3. send tickets to frontend
        req.result = {
          status: 1,
          result: reservedTicketsInfo,
        };
      } else {
        req.result = {
          status: 0,
          message: 'Sorry, there are no available tickets at the moment.',
        };
      }
    }
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function saveTicketOrder(req, res, next) {
  const eventId = req.params.id;
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  const userInfo = await Auth.checkToken(token);
  const userId = userInfo.id;
  // order: event_id, user_id
  // ticket: user_id, purchase_date
  // insert ticket_order table
  const buyTicketsArray = req.body;

  try {
    // check timer status
    const statusOkArray = await Ticket.checkTimerStatus(eventId, userId, buyTicketsArray);
    if (statusOkArray.length != 0) {
      await genQRcode(statusOkArray);
      const orderId = await Ticket.saveTicketOrder(eventId, userId, statusOkArray);
      req.order_result = orderId;
    } else {
      req.anti_order_result = 0;
    }
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getTicketDetails(req, res, next) {
  try {
    const ticketId = req.params.id;
    const ticketDetails = await Ticket.getTicketDetails(ticketId);
    req.result = ticketDetails;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getUserUnusedTicketsForListing(req, res, next) {
  try {
    const userId = req.params.id;
    const unusedTickets = await Ticket.getUserUnusedTicketsForListing(userId);
    req.result = unusedTickets;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function genQRcode(ticketIds) {
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

    // ticket URL to qrcode
    const ticketQR = await QRCode.toDataURL(ticketURL);

    // link qrcode with ticket_id, save into DB
    await Ticket.saveTicketURLAndQR(ticketURL, ticketQR, ticketId);
  }
}

function encryptTicketURL(ticketId) {
  ticketId = ticketId.toString();
  const ciphertext = CryptoJS.AES.encrypt(ticketId, key).toString();
  const ciphertextURLencoded = encodeURIComponent(ciphertext);
  return ciphertextURLencoded;
}

function decryptTicketURL(ticketURLHash) {
  const ticketURLHashDecoded = decodeURIComponent(ticketURLHash);
  const ciphertext = CryptoJS.AES.decrypt(ticketURLHashDecoded, key).toString(CryptoJS.enc.Utf8);
  return ciphertext;
}

async function authTicket(req, res, next) {
  // scan qrcode -> call veritifcation api
  // check req.result
  // if admin, check ticket status
  const userInfo = await Auth.checkUserRole(req);
  const adminId = userInfo.user_id;
  let message;
  if (userInfo.role !== 'admin') {
    message = 'not admin';
  } else { // check ticket status
    // decode ticket url to get ticket_id
    const ticketURLHash = encodeURIComponent(req.params.hash);
    const ticketId = await decryptTicketURL(ticketURLHash);

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
  try {
    const adminId = req.params.id;
    const verifiedTickets = await Ticket.getVerifiedTickets(adminId);
    req.result = verifiedTickets;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getSelectedEventTicketTypes(req, res, next) {
  try {
    const eventId = req.params.id;
    const ticketTypes = await Ticket.getSelectedEventTicketTypes(eventId);
    req.result = ticketTypes;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function postExchangeCondition(req, res, next) {
  try {
    const userId = req.body.user_id;
    const ticketId = parseInt(req.body.ticket_id);
    const selectedEventId = parseInt(req.body.selected_event_id);
    const selectedTicketType = req.body.selected_ticket_type;
    const listingId = await Ticket.saveExchangeAndListing(selectedEventId, selectedTicketType, userId, ticketId);
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
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getAllCurrentListings(req, res, next) {
  try {
    const userInfo = await Auth.checkUserRole(req);
    const userId = userInfo.user_id;
    const listings = await Ticket.getAllCurrentListings(userId);
    req.result = listings;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getUserCurrentListings(req, res, next) {
  try {
    const userId = req.params.id;
    const listings = await Ticket.getUserCurrentListings(userId);
    req.result = listings;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function postListingSelection(req, res, next) {
  try {
    // check if user_id has ticket that meets listing_id requirement
    const userId = parseInt(req.body.user_id);
    const listingSelectionId = parseInt(req.body.listing_selection_id);

    const userMatchingTickets = await Ticket.getUserMatchingTicketsForExchange(userId, listingSelectionId);
    const matchingTixLength = userMatchingTickets.length;
    if (userMatchingTickets.length > 0) {
      // update user_id, ticket_url, qrcode
      // need matched user_ids & ticket_ids
      // user_id = i have user_id
      // poster user_id (i want user_id)
      // ticket_id = i have ticket_id
      // poster ticket_id (i want ticket_id)
      const ticketId = userMatchingTickets[0].ticket_id;
      const posterUserId = userMatchingTickets[0].poster_user_id;
      const posterTicketId = userMatchingTickets[0].poster_ticket_id;

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
        return res.status(500).send({
          message: 'Something went wrong during the exchange, please try again',
        });
      } else {
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
        await Ticket.sendMessage(posterUserId, posterMessage);
        // current_user: send message to current_user
        const message = `Congratulations, you have successfully exchanged your ticket #${ticketId} for ticket #${posterTicketId}.`;
        await Ticket.sendMessage(userId, message);
      }
    } else {
      req.result = {
        status: 0,
        message: `Exchange was unsuccessful, please try again later.`,
      };
    }
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

module.exports = {reserveTickets, saveTicketOrder, getTicketDetails, getUserUnusedTicketsForListing, genQRcode, authTicket, getVerifiedTickets, getSelectedEventTicketTypes, postExchangeCondition, getAllCurrentListings, getUserCurrentListings, postListingSelection};
