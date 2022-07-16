const Event = require('../models/event-model');
const UserController = require('./user-controller');
const AuthController = require('./auth-controller');
const TicketController = require('./ticket-controller');
// var CryptoJS = require("crypto-js");

async function getEventFavStatus(req, res, next) {
  console.log('getEventFavStatus triggered');
  try {
    const eventId = req.params.id;
    console.log('event_id: ' + eventId);
    const userInfo = await AuthController.checkUserRole(req);
    const userId = userInfo.user_id;
    console.log('user_id: ' + userId);
    const favStatus = await Event.getEventFavStatus(eventId, userId);
    console.log(favStatus);
    if (favStatus.length === 0) {
      req.result = 0; // not fav
    } else {
      req.result = 1; // fav
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function postEventFavStatus(req, res, next) {
  console.log('postEventFavStatus triggered');
  try {
    const eventId = req.params.id;
    console.log('eventId: ' + eventId);
    const userInfo = await AuthController.checkUserRole(req);
    if (userInfo == 'No token') {
      return res.status(401).send({message: userInfo});
    } else {
      const userId = userInfo.user_id;
      const favStatus = await Event.postEventFavStatus(eventId, userId);
      console.log(favStatus);
      req.result = favStatus;
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function deleteEventFavStatus(req, res, next) {
  console.log('deleteEventFavStatus triggered');
  try {
    const eventId = req.params.id;
    console.log('eventId: ' + eventId);
    const userInfo = await AuthController.checkUserRole(req);
    const userId = userInfo.user_id;
    const favStatus = await Event.deleteEventFavStatus(eventId, userId);
    console.log(favStatus);
    req.result = favStatus;
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getEventDetailsAPI(req, res, next) {
  console.log('getEventDetailsAPI triggered');
  const id = req.params.id;
  console.log(id);
  try {
    const eventDetails = await Event.getEventDetails(id);
    const eventArtists = await Event.getEventArtists(id);
    // let eventDates = await Event.getEventDates(id);
    // console.log(eventDetails);
    // console.log(eventArtists);
    // console.log(eventDates);

    const eventArtistsArray = [];
    for (let i = 0; i < eventArtists.length; i++) {
      eventArtistsArray.push(eventArtists[i].artist_name);
    }
    eventDetails[0].artist = eventArtistsArray;
    console.log(eventDetails);

    req.result = eventDetails;
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getAvailableTickets(req, res, next) {
  console.log('getAvailableTickets triggered');
  const id = req.params.id;
  console.log(id);
  // get ticket_id, type, price, type_name
  try {
    const availTickets = await Event.getAvailTickets(id);
    req.result = availTickets;
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

// helper func
function printReq(req, res) {
  console.log('printReq triggered');
  console.log('req.headers.authorization: ');
  console.log(req.headers.authorization);
  console.log('req.body');
  console.log(req.body);
}

// save user_id, timer_timestamp
async function reserveTickets(req, res, next) {
  console.log('reserveTickets triggered');
  try {
    // temp: get user_id (check token) here
    // const authHeader = req.headers.authorization;
    // let token = authHeader.split(' ')[1];
    // let userInfo = await UserController.checkToken(token);
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

      const ticketsOK = [];
      for (let i = 0; i < tickets.ticket_number.length; i++) {
        const ticketNumber = parseInt(tickets.ticket_number[i]);
        const ticketTypeName = tickets.ticket_type[i];

        // 1. check available tickets for each ticket type, grab ticket ids
        const ticIds = await Event.checkAndReserveTickets(eventId, userId, ticketTypeName, ticketNumber);

        console.log('ticketTypeName: ' + ticketTypeName);
        console.log('ticIds: ');
        console.log(ticIds);
        // add error handling for no available ticket sitaution

        // 2. push available ticket_ids to array
        // for each ticket type
        const ticketTypeObj = {};
        if (!(ticketTypeName.ticket_type in ticketTypeObj)) {
          ticketTypeObj.ticket_type = ticketTypeName;
          // loop through each ticket_ids array
          // let ticketIDsArray = [];
          // for (let i = 0; i < tic_ids.length; i++) {
          //     ticketIDsArray.push(tic_ids[i]["ticket_id"]);
          // }
          ticketTypeObj.ticket_ids = ticIds;
          console.log(ticketTypeObj);
          ticketsOK.push(ticketTypeObj);
        }
      }
      // if all ticket types have available tickets
      console.log('reserved tickets array: ');
      console.log(ticketsOK);
      console.log('sending reserved tickets array to frontend');
      // 3. send tickets to frontend
      req.result = ticketsOK;
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
  const userInfo = await UserController.checkToken(token);
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
  const ticketIds = [];
  for (let i = 0; i < buyTicketsArray.length; i++) {
    const ticketId = buyTicketsArray[i].ticket_ids;
    // ticket_ids.push(ticket_id);
    for (let j = 0; j < ticketId.length; j++) {
      ticketIds.push(ticketId[j]);
    }
  }
  console.log(ticketIds);
  try {
    // check timer status
    const status = await Event.checkTimerStatus(ticketIds);
    console.log('---------------ticket timer status: ---------------');
    console.log(status);
    const tixOkArray = [];
    for (let i = 0; i < status.length; i++) {
      console.log(Object.keys(status[i]));
      if (Object.keys(status[i])[0] === 'ok') {
        tixOkArray.push(Object.values(status[i])[0]);
      }
    }
    console.log('------printing tixOkArray: ');
    console.log(tixOkArray);
    if (tixOkArray.length != 0) {
      await TicketController.genQRcode(tixOkArray);
      const orderId = await Event.saveTicketOrder(eventId, userId, tixOkArray);
      console.log(orderId);
      req.order_result = orderId;
    } else {
      console.log('some tickets have expired timer, returning expired ticket_ids to frontend');
      req.anti_order_result = status;
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getCurrentEvents(req, res, next) {
  console.log('getCurrentEvents triggered');
  const category = req.params.category;
  console.log('category: ' + category);
  let currentEvents;
  try {
    if (category == 'null') {
      currentEvents = await Event.getCurrentEvents();
    } else {
      currentEvents = await Event.getCurrentEventsByCategory(category);
    }
    req.result = currentEvents;
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getSearchOptions(req, res, next) {
  console.log('getSearchOptions triggered');
  try {
    const searchOptions = await Event.getCurrentEvents();
    const uniqueObjArray = [...new Map(searchOptions.map((item) => [item['city'], item])).values()];
    console.log('uniqueObjArray', uniqueObjArray);
    req.result = uniqueObjArray;
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getSearchedEvents(req, res, next) {
  console.log('getSearchedEvents triggered');
  const keyword = req.body.keyword;
  const category = req.body.category;
  const city = req.body.city;
  console.log(city);
  console.log(typeof(city));
  const dates = req.body.dates;
  const startDate = dates.split(' ')[0];
  const endDate = dates.split(' ')[2];
  console.log(req.body);
  console.log(startDate);
  console.log(endDate);
  // console.log("keyword: " + keyword);
  // console.log(category);
  let searchedEvents;
  try {
    searchedEvents = await Event.getSearchedEvents(keyword, category, city, startDate, endDate);
    req.result = searchedEvents;
    console.log(searchedEvents);
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getCurrentEventsForExchange(req, res, next) {
  console.log('getCurrentEventsForExchange triggered');
  try {
    const currentEvents = await Event.getCurrentEventsForExchange();
    console.log(currentEvents);
    req.result = currentEvents;
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

module.exports = {printReq, getEventFavStatus, postEventFavStatus, deleteEventFavStatus, getEventDetailsAPI, getAvailableTickets, reserveTickets, saveTicketOrder, getCurrentEvents, getSearchOptions, getSearchedEvents, getCurrentEventsForExchange};
