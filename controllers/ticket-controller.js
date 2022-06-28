const Ticket = require('../models/ticket-model');

async function getTicketDetails(req, res, next){
    console.log("getTicketDetails triggered");
    try {
        let ticket_id = req.params.id;
        console.log(ticket_id);
        let ticketDetails = await Ticket.getTicketDetails(ticket_id);
        console.log(ticketDetails);
        let eventDetailsForTicket = await Ticket.getEventDetailsForTicket(ticket_id);
        console.log(eventDetailsForTicket);
        let arrayObj = {};
        // for (let i = 0; i < .length; i++) {}
        arrayObj.title = eventDetailsForTicket[0].title;
        arrayObj.city = eventDetailsForTicket[0].city;
        arrayObj.avenue = eventDetailsForTicket[0].avenue;
        arrayObj.date = eventDetailsForTicket[0].start_date;
        arrayObj.ticket_price = ticketDetails[0].price;
        arrayObj.ticket_type = ticketDetails[0].type_name;
        req.result = arrayObj;
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

module.exports = { getTicketDetails };