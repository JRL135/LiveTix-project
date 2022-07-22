const {pool} = require('../models/sqlconfig');

const reserveTicketsOnlyOneTest = async (eventId, limit)=>{
  const [ticketsBeforeTest] = await pool.query(`UPDATE tickets SET temp_status = '1' WHERE event_id = ? limit ?`, [eventId, limit]);
  return ticketsBeforeTest;
};

const reserveTicketsOnlyOneTestRestore = async (eventId, limit)=>{
  const [ticketsAfterTest] = await pool.query(`UPDATE tickets SET temp_status = '0' WHERE event_id = ? limit ?`, [eventId, limit]);
  return ticketsAfterTest;
};


module.exports = {reserveTicketsOnlyOneTest, reserveTicketsOnlyOneTestRestore};
