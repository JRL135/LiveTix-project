// require('dotenv').config();
const {pool} = require('./sqlconfig.js');

const getTicketDetails = async (ticket_id)=>{
    const [ticketDetails] = await pool.query(`SELECT * FROM ticket WHERE ticket_id = ?`, ticket_id);
    return ticketDetails;
};

const getEventDetailsForTicket = async (ticket_id)=>{
    const [eventDetails] = await pool.query(`select title, city, avenue, DATE_FORMAT(start_date,'%Y-%m-%d') as start_date from event where event_id in (select event_id from live.ticket where ticket_id = ?)`, ticket_id);
    return eventDetails;
}

module.exports = {getTicketDetails, getEventDetailsForTicket};