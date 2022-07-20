const {pool} = require('./sqlconfig.js');


const getEventFavStatus = async (eventId, userId)=>{
  const [eventFavStatus] = await pool.query(`SELECT * FROM favorites WHERE event_id = ? AND user_id = ?`, [eventId, userId]);
  return eventFavStatus;
};

const postEventFavStatus = async (eventId, userId)=>{
  const [eventFavStatus] = await pool.query(`INSERT INTO favorites (event_id, user_id) VALUES(?, ?)`, [eventId, userId]);
  return eventFavStatus;
};

const deleteEventFavStatus = async (eventId, userId)=>{
  const [eventFavStatus] = await pool.query(`DELETE FROM favorites WHERE event_id = ? AND user_id = ?`, [eventId, userId]);
  return eventFavStatus;
};

const getEventDetails = async (id)=>{
  const [eventDetails] = await pool.query(`SELECT * FROM events WHERE event_id = ?`, id);
  return eventDetails;
};

const getEventArtists = async (id)=>{
  const [eventArtists] = await pool.query(`SELECT artist_name FROM artists WHERE artist_id IN (SELECT artist_id FROM artist_event WHERE event_id = ?);`, id);
  return eventArtists;
};

const getEventDates = async (id)=>{
  const [eventDates] = await pool.query(`SELECT start_date, end_date FROM events WHERE event_id = ?`, id);
  return eventDates;
};

const getAvailTickets = async (id)=>{
  const [availTickets] = await pool.query(`SELECT ticket_id, type, price, type_name FROM tickets WHERE event_id = ? AND temp_status = '0'`, id);
  return availTickets;
};

const checkAndReserveTickets = async (eventId, userId, ticketTypeName, ticketNumber)=>{
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    await conn.query('LOCK TABLE tickets WRITE');
    const [reservedTickets] = await conn.query(`SELECT ticket_id from tickets WHERE event_id = ? and temp_status = '0' and type_name = ? limit ?`, [eventId, ticketTypeName, ticketNumber]);
    const ticketIdArray = [];
    for (let i = 0; i < reservedTickets.length; i++) {
      const ticketId = reservedTickets[i].ticket_id;
      console.log(ticketId);
      ticketIdArray.push(ticketId);
    }
    await conn.query(`UPDATE tickets SET user_id = ?, timer_timestamp = NOW(), temp_status = '1' WHERE ticket_id IN (?)`, [userId, ticketIdArray]);

    await conn.query('COMMIT');
    await conn.query('UNLOCK TABLES');
    return ticketIdArray;
  } catch (error) {
    console.log(error);
    await conn.query('ROLLBACK');
    return {error};
  } finally {
    await conn.release();
  }
};

const checkTimerStatus = async (ticketIds)=>{
  console.log('checking ticket timer');
  // check backend timer does not exceed 5m
  const array = [];
  for (let i = 0; i < ticketIds.length; i++) {
    const ticketId = ticketIds[i];
    const [tixWithinCountdown] = await pool.query(`SELECT * FROM tickets WHERE ticket_id =? AND DATE_ADD(timer_timestamp, INTERVAL 300 second) >= NOW()`, ticketId);
    console.log(tixWithinCountdown);

    const tempObj = {};
    if (tixWithinCountdown.length === 0) {
      console.log(`tixWithinCountdown is empty, countdown has timed out for ticket_id: ${ticketId}`);
      [statusUpdate] = await pool.query(`UPDATE tickets SET temp_status = '0' AND timer_timestamp = null WHERE ticket_id = ?`, ticketId);
      tempObj.expired = ticketId;
      array.push(tempObj);
    } else {
      console.log('timer has not expired, returning tixWithinCountdown');
      tempObj.ok = ticketId;
      array.push(tempObj);
    }
  }
  return array;
};

// order: event_id, user_id
// ticket: user_id, purchase_date
const saveTicketOrder = async (eventId, userId, ticketIds)=>{
  const conn = await pool.getConnection();
  try {
    console.log('saveTicketOrder in model try catch');
    console.log(eventId);
    console.log(userId);
    await conn.query('START TRANSACTION');
    await conn.query('LOCK TABLE tickets WRITE');
    // await conn.query('LOCK TABLE orders WRITE');


    // order_query
    const [orderQuery] = await conn.query(`INSERT INTO orders (event_id, user_id) VALUES (?, ?)`, [eventId, userId]);
    console.log(typeof(orderQuery));
    console.log(orderQuery);


    const orderId = orderQuery.insertId;
    console.log('orderId in model:');
    console.log(orderId);


    for (let i = 0; i < ticketIds.length; i++) {
      const ticketId = ticketIds[i];
      await conn.query(`UPDATE tickets SET purchase_date = NOW() WHERE ticket_id = ?`, ticketId);
      await conn.query(`INSERT INTO ticket_order (order_id, ticket_id) VALUES (?, ?)`, [orderId, ticketId]);
    }
    await conn.query('COMMIT');
    await conn.query('UNLOCK TABLES');
    return orderId;
  } catch (error) {
    console.log(error);
    await conn.query('ROLLBACK');
    return {error};
  } finally {
    await conn.release();
  }
};

const getCurrentEvents = async ()=>{
  const [currentEvents] = await pool.query(`SELECT * FROM events WHERE end_date >= CURDATE()`);
  return currentEvents;
};

const getCurrentEventsByCategory = async (category)=>{
  const [currentEvents] = await pool.query(`SELECT * FROM events WHERE end_date >= CURDATE() AND category = ?`, category);
  return currentEvents;
};


// search querie
const getSearchedEvents = async (keyword, category, city, startDate, endDate)=>{
  let categoryCondition;
  if (category != 0) {
    categoryCondition = 'and';
  } else {
    categoryCondition = 'or';
  }
  let cityCondition;
  if (city != 0) {
    cityCondition = 'and';
  } else {
    cityCondition = 'or';
  }
  const [searchedEvents] = await pool.query(`SELECT * FROM events WHERE (title LIKE ?) AND (category = ? ${categoryCondition} category IS NOT NULL) AND (city = ? ${cityCondition} city IS NOT NULL) AND (start_date BETWEEN ? AND ? OR ? BETWEEN start_date AND end_date) ORDER BY start_date ASC`, [`%${keyword}%`, `${category}`, `${city}`, `${startDate}`, `${endDate}`, `${startDate}`]);
  return searchedEvents;
};

const getCurrentEventsForExchange = async ()=>{
  const [currentEvents] = await pool.query(`SELECT * FROM events WHERE end_date >= CURDATE()`);
  return currentEvents;
};


module.exports = {getEventFavStatus, postEventFavStatus, deleteEventFavStatus, getEventDetails, getEventArtists, getEventDates, getAvailTickets, checkAndReserveTickets, checkTimerStatus, saveTicketOrder, getCurrentEvents, getCurrentEventsByCategory, getSearchedEvents, getCurrentEventsForExchange};
