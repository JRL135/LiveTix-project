const Event = require('../models/event-model');
var CryptoJS = require("crypto-js");


async function getEventDetailsAPI(req, res, next){
    console.log('getEventDetailsAPI triggered');
    let id = req.params.id;
    console.log(id);
    try {
        let eventDetails = await Event.getEventDetails(id);
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

async function reserveTickets(req, res, next){
    console.log('reserveTickets triggered');
    try {
        //temp: get user_id (check token) here
        const authHeader = req.headers.authorization;
        console.log(authHeader); //should be Bearer 12345
        let user_id = authHeader.split(' ')[1];
        //get ticket_type, ticket_number

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
    let user_id = 1;
    console.log(id);
    //order: event_id, user_id
    //ticket: user_id, purchase_date
    //insert ticket_order table
    try {
        let a = await Event.saveOrder(event_id, user_id);
        console.log(a);
        let b = await Event.saveTicket(user_id, ticket_id);
        console.log(b)
        // get a, b => 
        await Event.saveTicket_Order();
        // req.result = availTickets;
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}


module.exports = {getEventDetailsAPI, getAvailableTickets, reserveTickets, saveTicketOrder};
