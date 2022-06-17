// require('dotenv').config();
const {pool} = require('./sqlconfig.js');

// select from event table
const getEventDetails = async (id)=>{
    const [eventDetails] = await pool.query(`SELECT * FROM event where event_id=?`, id);
    return eventDetails;
};

const getAvailTickets = async (id)=>{
    const [availTickets] = await pool.query(`SELECT ticket_id, type, price, type_name FROM ticket WHERE temp_status = '0'`);
    return availTickets;
};

//order: event_id, user_id
const saveOrder = async (event_id, user_id)=>{
    const [order] = await pool.query(`INSERT INTO order (event_id, user_id) VALUES (?)`, [event_id, user_id]);
    return order;
};

//`UPDATE ticket SET user_id = '1', temp_status = '1', timer_timestamp = NOW() WHERE temp_status = '0' AND ticket_id = '1'`
//ticket: user_id, purchase_date
const saveTicket = async (user_id, ticket_id)=>{
    const [ticket] = await pool.query(`UPDATE ticket SET user_id = ?, purchase_date = NOW() WHERE ticket_id = ?`, user_id);
    return ticket;
};

//insert ticket_order table


module.exports = {getEventDetails, getAvailTickets, saveOrder, saveTicket};