const Event = require('../models/event-model');
const Auth = require('../utils/auth');

async function getEventFavStatus(req, res, next) {
  console.log('getEventFavStatus triggered');
  try {
    const eventId = req.params.id;
    console.log('event_id: ' + eventId);
    const userInfo = await Auth.checkUserRole(req);
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
    const userInfo = await Auth.checkUserRole(req);
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
    const userInfo = await Auth.checkUserRole(req);
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

async function genSearchedEvents(req, res, next) {
  console.log('genSearchedEvents triggered');
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
    searchedEvents = await Event.genSearchedEvents(keyword, category, city, startDate, endDate);
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

module.exports = {getEventFavStatus, postEventFavStatus, deleteEventFavStatus, getEventDetailsAPI, getAvailableTickets, getCurrentEvents, getSearchOptions, genSearchedEvents, getCurrentEventsForExchange};
