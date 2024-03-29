require('dotenv').config();
const express = require('express');
const {getEventFavStatus, postEventFavStatus, deleteEventFavStatus, getEventDetailsAPI, getAvailableTickets, getCurrentEvents, getSearchOptions, genSearchedEvents, getCurrentEventsForExchange} = require('./controllers/event-controller');
const {registerUser, loginUser, getUserProfile, getUserUnusedTickets, getUserUsedTickets, getUserFavEvents, getUserMessages} = require('./controllers/user-controller');
const {getTicketDetails, reserveTickets, saveTicketOrder, authTicket, getVerifiedTickets, getUserUnusedTicketsForListing, getSelectedEventTicketTypes, postExchangeCondition, getAllCurrentListings, getUserCurrentListings, postListingSelection} = require('./controllers/ticket-controller');
const {checkUserMiddleware, checkIndividualUser} = require('./utils/auth');


const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(express.static('public'));

app.get('/', (req, res)=>{
  res.send('homepage');
});

// APIs
app.get(`/api/${process.env.api}/event/:id`, getEventDetailsAPI, (req, res)=>{
  res.json(req.result);
});

app.get(`/api/${process.env.api}/event/:id/tickets`, getAvailableTickets, (req, res)=>{
  res.json(req.result);
});

app.post(`/api/${process.env.api}/event/:id/tickets/reserve`, checkUserMiddleware, reserveTickets, (req, res)=>{
  res.json(req.result);
});

app.post(`/api/${process.env.api}/event/:id/tickets/buy`, saveTicketOrder, (req, res)=>{
  res.json({
    success: req.order_result,
    failure: req.anti_order_result,
  });
});

app.get(`/api/${process.env.api}/events/:category`, getCurrentEvents, (req, res)=>{
  res.json(req.result);
});

app.get(`/api/${process.env.api}/events/:keyword`, genSearchedEvents, (req, res)=>{
  res.json(req.result);
});

app.get(`/api/${process.env.api}/search/events`, getSearchOptions, (req, res)=>{
  res.json(req.result);
});

app.post(`/api/${process.env.api}/search/results`, genSearchedEvents, (req, res)=>{
  res.json(req.result);
});

app.post(`/user/signup`, registerUser, (req, res)=>{
  res.json(req.result);
});

app.post(`/user/login`, loginUser, (req, res)=>{
  res.json(req.result);
});

app.get(`/api/${process.env.api}/user/profile`, getUserProfile, (req, res)=>{
  res.json(req.result);
});

app.get(`/api/${process.env.api}/user/:username/tickets/unused`, getUserUnusedTickets, (req, res)=>{
  res.json(req.result);
});

app.get(`/api/${process.env.api}/user/:username/tickets/used`, getUserUsedTickets, (req, res)=>{
  res.json(req.result);
});

app.get(`/api/${process.env.api}/user/:username/events/favorite`, getUserFavEvents, (req, res)=>{
  res.json(req.result);
});

app.get(`/api/${process.env.api}/ticket/:id`, checkUserMiddleware, checkIndividualUser, getTicketDetails, (req, res)=>{
  res.json(req.result);
});

app.get(`/api/${process.env.api}/event/:id/user/favorite`, getEventFavStatus, (req, res)=>{
  res.json(req.result);
});

app.post(`/api/${process.env.api}/event/:id/user/favorite`, checkUserMiddleware, postEventFavStatus, (req, res)=>{
  res.json(req.result);
});

app.delete(`/api/${process.env.api}/event/:id/user/favorite`, deleteEventFavStatus, (req, res)=>{
  res.json(req.result);
});

// ticket-management
app.get(`/api/${process.env.api}/ticket/ticket-management/verified-tickets/admin/:id`, getVerifiedTickets, (req, res)=>{
  res.json(req.result);
});

// ticket-verification
app.get(`/ticket/verification/:hash`, authTicket, (req, res)=>{
  res.json(req.result);
});

// ticket-listing: fetch user unused tickets for listing
app.get(`/api/${process.env.api}/ticket/ticket-listing/unused-tickets/user/:id`, getUserUnusedTicketsForListing, (req, res)=>{
  res.json(req.result);
});

// ticket-listing: fetch current events for listing condition
app.get(`/api/${process.env.api}/ticket/ticket-listing/exchange-conditions/events`, getCurrentEventsForExchange, (req, res)=>{
  res.json(req.result);
});

// ticket-listing: fetch selected event ticket types for listing
app.get(`/api/${process.env.api}/ticket/ticket-listing/event/:id/ticket-types`, getSelectedEventTicketTypes, (req, res)=>{
  res.json(req.result);
});

// ticket-listing: POST exchnage ticket & conditions to backend
app.post(`/api/${process.env.api}/ticket/ticket-listing/exchange`, postExchangeCondition, (req, res)=>{
  res.json(req.result);
});

// marketplace: get all listings
app.get(`/api/${process.env.api}/ticket/marketplace/listings`, getAllCurrentListings, (req, res)=>{
  res.json(req.result);
});

// marketplace: get user listings
app.get(`/api/${process.env.api}/ticket/marketplace/listings/user/:id`, getUserCurrentListings, (req, res)=>{
  res.json(req.result);
});

// marketplace: postListingSelection
app.post(`/api/${process.env.api}/ticket/marketplace/selection`, postListingSelection, (req, res)=>{
  res.json(req.result);
});

// message: get user messages
app.get(`/api/${process.env.api}/user/:id/message`, getUserMessages, (req, res)=>{
  res.json(req.result);
});


// generic checkUserRole api
app.get(`/user/role`, checkUserMiddleware, (req, res)=>{
  res.json(req.result);
});


const PORT = process.env.PORT;
const MODE = process.env.MODE;
app.listen(PORT, () => console.log(`Server is listening on port ${PORT} on ${MODE} mode`));

module.exports = app;
