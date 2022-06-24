const Event = require('../models/event-model');
// var CryptoJS = require("crypto-js");


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
// where 
async function reserveTickets(req, res, next){
    console.log('reserveTickets triggered');
    try {
        //temp: get user_id (check token) here
        const authHeader = req.headers.authorization;
        // console.log(authHeader); //should be Bearer 12345
        let user_id = authHeader.split(' ')[1];
        console.log("user_id: " + user_id);
        //get ticket_type, ticket_number
        let tickets = req.body;
        console.log(tickets);
    
        let ticketsOK = [];
        for (let i = 0; i < tickets.ticket_number.length; i++) {
            let ticketNumber = parseInt(tickets.ticket_number[i]);
            let ticketType = tickets.ticket_type[i];

            // 1. check available tickets for each ticket type, grab ticket ids
            let tic_ids = await Event.checkAndReserveTickets(user_id, ticketType, ticketNumber);
            
            console.log("ticketType: " + ticketType);
            console.log("tic_ids: ");
            console.log(tic_ids);
            // add error handling for no available ticket sitaution

            // 2. push available ticket_ids to array
            // for each ticket type
            let ticketTypeObj = {};
            if (!(ticketType.ticket_type in ticketTypeObj)) {
                ticketTypeObj.ticket_type = ticketType;
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
        // 3. return results to frontend
        console.log(ticketsOK);
        console.log('sending reserved tickets array to frontend');
        req.result = ticketsOK;

    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

// let cryptoData = availTickets;

// // Encrypt
// var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'secret key 123').toString();

// // Decrypt
// var bytes  = CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
// var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

// console.log(decryptedData); // [{id: 1}, {id: 2}]

// JWT token 10m save user_id, ticket_id??
async function saveTicketOrder(req, res, next){
    console.log('saveTicketOrder triggered');
    let event_id = req.params.id;
    const authHeader = req.headers.authorization;
    // console.log(authHeader); //should be Bearer 12345
    let user_id = authHeader.split(' ')[1];
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
        let order_id = await Event.saveTicketOrder(event_id, user_id, ticket_ids);
        console.log(order_id);
        req.result = order_id;
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
    try {
        if (category === 'null') {
            let currentEvents = await Event.getCurrentEvents();
            req.result = currentEvents;
        } else {
            let currentEvents = await Event.getCurrentEventsByCategory(category);
            req.result = currentEvents;
        }
        // req.result = currentEvents;
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

async function getSearchedEvents (req, res, next){
    console.log('getSearchedEvents triggered');
    let keyword = req.body.keyword;
    let category = req.body.cateogry;
    let city = req.body.city;
    let dates = req.body.dates;
    let start_date = dates.split(' ')[0];
    let end_date = dates.split(' ')[2];
    console.log(start_date);
    console.log(end_date);
    console.log("keyword: " + keyword);
    try {
        let searchedEvents = await Event.getSearchedEvents(keyword, category, city, start_date, end_date);
        req.result = searchedEvents;
        console.log(searchedEvents);
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}


module.exports = {printReq, getEventDetailsAPI, getAvailableTickets, reserveTickets, saveTicketOrder, getCurrentEvents, getSearchedEvents};
