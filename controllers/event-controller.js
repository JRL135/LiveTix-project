const Event = require('../models/event-model');
const Auth = require('../utils/auth');

async function getEventFavStatus(req, res, next) {
  try {
    const eventId = req.params.id;
    const userInfo = await Auth.checkUserRole(req);
    const userId = userInfo.user_id;
    const favStatus = await Event.getEventFavStatus(eventId, userId);
    if (favStatus.length === 0) {
      req.result = 0; // not fav
    } else {
      req.result = 1; // fav
    }
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function postEventFavStatus(req, res, next) {
  try {
    const eventId = req.params.id;
    const userInfo = await Auth.checkUserRole(req);
    if (userInfo == 'No token') {
      return res.status(401).send({message: userInfo});
    } else {
      const userId = userInfo.user_id;
      const favStatus = await Event.postEventFavStatus(eventId, userId);
      req.result = favStatus;
    }
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function deleteEventFavStatus(req, res, next) {
  try {
    const eventId = req.params.id;
    const userInfo = await Auth.checkUserRole(req);
    const userId = userInfo.user_id;
    const favStatus = await Event.deleteEventFavStatus(eventId, userId);
    req.result = favStatus;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getEventDetailsAPI(req, res, next) {
  const id = req.params.id;
  try {
    const eventDetails = await Event.getEventDetails(id);
    const eventArtists = await Event.getEventArtists(id);

    const eventArtistsArray = [];
    for (let i = 0; i < eventArtists.length; i++) {
      eventArtistsArray.push(eventArtists[i].artist_name);
    }
    eventDetails[0].artist = eventArtistsArray;
    req.result = eventDetails;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getAvailableTickets(req, res, next) {
  const id = req.params.id;
  // get ticket_id, type, price, type_name
  try {
    const availTickets = await Event.getAvailTickets(id);
    req.result = availTickets;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getCurrentEvents(req, res, next) {
  const category = req.params.category;
  let currentEvents;
  try {
    if (category == 'null') {
      currentEvents = await Event.getCurrentEvents();
    } else {
      currentEvents = await Event.getCurrentEventsByCategory(category);
    }
    req.result = currentEvents;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getSearchOptions(req, res, next) {
  try {
    const searchOptions = await Event.getCurrentEvents();
    const uniqueObjArray = [...new Map(searchOptions.map((item) => [item['city'], item])).values()];
    req.result = uniqueObjArray;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function genSearchedEvents(req, res, next) {
  const keyword = req.body.keyword;
  const category = req.body.category;
  const city = req.body.city;
  const dates = req.body.dates;
  const startDate = dates.split(' ')[0];
  const endDate = dates.split(' ')[2];
  let searchedEvents;
  try {
    searchedEvents = await Event.genSearchedEvents(keyword, category, city, startDate, endDate);
    req.result = searchedEvents;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getCurrentEventsForExchange(req, res, next) {
  try {
    const currentEvents = await Event.getCurrentEventsForExchange();
    req.result = currentEvents;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

module.exports = {getEventFavStatus, postEventFavStatus, deleteEventFavStatus, getEventDetailsAPI, getAvailableTickets, getCurrentEvents, getSearchOptions, genSearchedEvents, getCurrentEventsForExchange};
