const Event = require('../models/event-model');
const UserController = require('./user-controller');
const TicketController = require('./ticket-controller');
// var CryptoJS = require("crypto-js");

async function getEventFavStatus(req, res, next){
    console.log('getEventFavStatus triggered');
    try {
        let event_id = req.params.id;
        console.log("event_id: " + event_id);
        let userInfo = await UserController.checkUserRole(req);
        let user_id = userInfo.user_id;
        console.log("user_id: " + user_id);
        let favStatus = await Event.getEventFavStatus(event_id, user_id);
        console.log(favStatus);
        if (favStatus.length === 0) {
            req.result = 0; // not fav
        } else {
            req.result = 1; // fav
        }
    }catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

async function postEventFavStatus(req, res, next){
    console.log('postEventFavStatus triggered');
    try {
        let event_id = req.params.id;
        console.log("event_id: " + event_id);
        let userInfo = await UserController.checkUserRole(req);
        if (userInfo == 'No token') {
            return res.status(401).send({message: userInfo})
        } else {
            let user_id = userInfo.user_id;
            let favStatus = await Event.postEventFavStatus(event_id, user_id);
            console.log(favStatus);
            req.result = favStatus;
        }
    }catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

async function deleteEventFavStatus(req, res, next){
    console.log('deleteEventFavStatus triggered');
    try {
        let event_id = req.params.id;
        console.log("event_id: " + event_id);
        let userInfo = await UserController.checkUserRole(req);
        let user_id = userInfo.user_id;
        let favStatus = await Event.deleteEventFavStatus(event_id, user_id);
        console.log(favStatus);
        req.result = favStatus;
    }catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

async function getEventDetailsAPI(req, res, next){
    console.log('getEventDetailsAPI triggered');
    let id = req.params.id;
    console.log(id);
    try {
        let eventDetails = await Event.getEventDetails(id);
        let eventArtists = await Event.getEventArtists(id);
        // let eventDates = await Event.getEventDates(id);
        // console.log(eventDetails);
        // console.log(eventArtists);
        // console.log(eventDates);

        let event_artists_array = [];
        for (let i = 0; i < eventArtists.length; i++) {
            event_artists_array.push(eventArtists[i].artist_name)
        }
        eventDetails[0].artist = event_artists_array;
        console.log(eventDetails);

        req.result = eventDetails;
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

async function getAvailableTickets(req, res, next){
    console.log('getAvailableTickets triggered');
    let id = req.params.id;
    console.log(id);
    //get ticket_id, type, price, type_name
    try {
        let availTickets = await Event.getAvailTickets(id);
        req.result = availTickets;
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

// helper func
function printReq(req, res){
    console.log("printReq triggered");
    console.log("req.headers.authorization: ");
    console.log(req.headers.authorization);
    console.log("req.body");
    console.log(req.body);
}

// save user_id, timer_timestamp
async function reserveTickets(req, res, next){
    console.log('reserveTickets triggered');
    try {
        //temp: get user_id (check token) here
        // const authHeader = req.headers.authorization;
        // let token = authHeader.split(' ')[1];
        // let userInfo = await UserController.checkToken(token);
        if (req.result == 'No token') {
            console.log(req.result + ", calling next");
            next();
        } else {
            console.log(req.result);
            let user_id = req.result.user_id;
            console.log("user_id: " + user_id);
            //get ticket_type, ticket_number
            let tickets = req.body;
            console.log("------------------");
            console.log(tickets);
            let event_id = req.body.event_id;
        
            let ticketsOK = [];
            for (let i = 0; i < tickets.ticket_number.length; i++) {
                let ticketNumber = parseInt(tickets.ticket_number[i]);
                let ticketTypeName = tickets.ticket_type[i];

                // 1. check available tickets for each ticket type, grab ticket ids
                let tic_ids = await Event.checkAndReserveTickets(event_id, user_id, ticketTypeName, ticketNumber);
                
                console.log("ticketTypeName: " + ticketTypeName);
                console.log("tic_ids: ");
                console.log(tic_ids);
                // add error handling for no available ticket sitaution

                // 2. push available ticket_ids to array
                // for each ticket type
                let ticketTypeObj = {};
                if (!(ticketTypeName.ticket_type in ticketTypeObj)) {
                    ticketTypeObj.ticket_type = ticketTypeName;
                    // loop through each ticket_ids array
                    // let ticketIDsArray = [];
                    // for (let i = 0; i < tic_ids.length; i++) {
                    //     ticketIDsArray.push(tic_ids[i]["ticket_id"]);
                    // }
                    ticketTypeObj.ticket_ids = tic_ids;
                    console.log(ticketTypeObj);
                    ticketsOK.push(ticketTypeObj);
                }
            }
            // if all ticket types have available tickets
            console.log("reserved tickets array: ");
            console.log(ticketsOK);
            console.log('sending reserved tickets array to frontend');
            // 3. send tickets to frontend
            req.result = ticketsOK;
        }
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}


async function saveTicketOrder(req, res, next){
    console.log('saveTicketOrder triggered');
    let event_id = req.params.id;
    const authHeader = req.headers.authorization;
    let token = authHeader.split(' ')[1];
    let userInfo = await UserController.checkToken(token);
    console.log("userInfo:");
    console.log(userInfo);
    let user_id = userInfo.id;
    console.log("user_id: " + user_id);
    //order: event_id, user_id
    //ticket: user_id, purchase_date
    //insert ticket_order table
    let buyTicketsArray = req.body;
    console.log("buyTicketsArray in saveTicketOrder:");
    console.log(buyTicketsArray);
    let ticket_ids = [];
    for (let i = 0; i < buyTicketsArray.length; i++) {
        let ticket_id = buyTicketsArray[i].ticket_ids;
        // ticket_ids.push(ticket_id);
        for (let j = 0; j < ticket_id.length; j++) {
            ticket_ids.push(ticket_id[j]);
        }
    }
    console.log(ticket_ids);
    try {
        // check timer status
        let status = await Event.checkTimerStatus(ticket_ids);
        console.log("---------------ticket timer status: ---------------");
        console.log(status);
        let tix_ok_array = [];
        for (let i = 0; i < status.length; i++) {
            console.log(Object.keys(status[i]));
            if (Object.keys(status[i])[0] === 'ok'){
                tix_ok_array.push(Object.values(status[i])[0]);
            }
        }
        console.log("------printing tix_ok_array: ");
        console.log(tix_ok_array);
        if (tix_ok_array.length != 0){
            await TicketController.genQRcode(tix_ok_array);
            let order_id = await Event.saveTicketOrder(event_id, user_id, tix_ok_array);
            console.log(order_id);
            req.order_result = order_id;
        }
        else {
            console.log("some tickets have expired timer, returning expired ticket_ids to frontend");
            req.anti_order_result = status;
        }
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

async function getCurrentEvents (req, res, next){
    console.log('getCurrentEvents triggered');
    let category = req.params.category;
    console.log("category: " + category);
    let currentEvents;
    try {
        if (category == 'null') {
            currentEvents = await Event.getCurrentEvents();
        } else {
            currentEvents = await Event.getCurrentEventsByCategory(category);
        }
        req.result = currentEvents;
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

async function getSearchOptions (req, res, next){
    console.log('getSearchOptions triggered');
    try{
        let searchOptions = await Event.getCurrentEvents();
        let uniqueObjArray = [ ...new Map(searchOptions.map((item) => [item["city"], item])).values(), ];
        console.log("uniqueObjArray", uniqueObjArray);
        req.result = uniqueObjArray;
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

async function getSearchedEvents (req, res, next){
    console.log('getSearchedEvents triggered');
    let keyword = req.body.keyword;
    let category = req.body.category;
    let city = req.body.city;
    console.log(city);
    console.log(typeof(city));
    let dates = req.body.dates;
    let start_date = dates.split(' ')[0];
    let end_date = dates.split(' ')[2];
    console.log(req.body);
    console.log(start_date);
    console.log(end_date);
    // console.log("keyword: " + keyword);
    // console.log(category);
    let searchedEvents;
    try {
        searchedEvents = await Event.getSearchedEvents(keyword, category, city, start_date, end_date);
        req.result = searchedEvents;
        console.log(searchedEvents);
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

async function getCurrentEventsForExchange (req, res, next){
    console.log('getCurrentEventsForExchange triggered');
    try {
        let currentEvents = await Event.getCurrentEventsForExchange();
        console.log(currentEvents);
        req.result = currentEvents;
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

module.exports = {printReq, getEventFavStatus, postEventFavStatus, deleteEventFavStatus, getEventDetailsAPI, getAvailableTickets, reserveTickets, saveTicketOrder, getCurrentEvents, getSearchOptions, getSearchedEvents, getCurrentEventsForExchange};
