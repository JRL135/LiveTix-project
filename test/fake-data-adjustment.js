const {pool} = require('../models/sqlconfig');

const reserveTicketsOnlyOneTest = async (eventId, limit)=>{
  const [ticketsBeforeTest] = await pool.query(`UPDATE tickets SET temp_status = '1' WHERE event_id = ? limit ?`, [eventId, limit]);
  return ticketsBeforeTest;
};

const reserveTicketsOnlyOneTestRestore = async (eventId)=>{
  const [ticketsAfterTest] = await pool.query(`UPDATE tickets SET temp_status = '0', user_id = NULL, purchase_date = NULL, timer_timestamp = NULL, ticket_url = NULL, qrcode = NULL where event_id = ?`, eventId);
  return ticketsAfterTest;
};


module.exports = {reserveTicketsOnlyOneTest, reserveTicketsOnlyOneTestRestore};
