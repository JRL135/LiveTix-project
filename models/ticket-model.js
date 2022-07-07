// require('dotenv').config();
const {pool} = require('./sqlconfig.js');

const getTicketInfo = async (ticket_id)=>{
    const [ticketInfo] = await pool.query(`SELECT user_id FROM ticket WHERE ticket_id = ?`, ticket_id);
    return ticketInfo;
};

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

const getVerifiedTickets = async (admin_id)=>{
    const [ticketDetails] = await pool.query(`SELECT t1.event_id as event_id, t1.category as category, t1.title as title, DATE_FORMAT(t1.start_date,'%Y-%m-%d') as start_date, DATE_FORMAT(t1.end_date,'%Y-%m-%d') as end_date, t1.city as city, t1.avenue as avenue, t2.ticket_id as ticket_id, t2.user_id as user_id, DATE_FORMAT(t2.verified_time,'%Y-%m-%d') as verified_time, t2.price as price, t2.type_name as type_name, DATE_FORMAT(t2.ticket_start_date,'%Y-%m-%d') ticket_start_date, DATE_FORMAT(t2.ticket_end_date,'%Y-%m-%d') as ticket_end_date from event t1 INNER JOIN ticket t2 ON t1.event_id = t2.event_id WHERE verified_id = ?`, admin_id);
    return ticketDetails;
};

module.exports = { getTicketInfo, getTicketDetails, getEventDetailsForTicket, updateUsed, saveTicketURLAndQR, getVerifiedTickets };