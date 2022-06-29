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

const updateUsed = async (ticket_id)=>{
    const [ticketUpdated] = await pool.query(`UPDATE ticket SET used_status = '1' WHERE ticket_id = ?`, ticket_id);
    return ticketUpdated;
}

const saveTicketURLAndQR = async (ticketURL, ticketQR, ticket_id)=>{
    const [ticketUpdated] = await pool.query(`UPDATE ticket SET ticket_url = ?, qrcode = ? WHERE ticket_id = ?`, [ticketURL, ticketQR, ticket_id]);
    return ticketUpdated;
}

module.exports = {getTicketDetails, getEventDetailsForTicket, updateUsed, saveTicketURLAndQR};