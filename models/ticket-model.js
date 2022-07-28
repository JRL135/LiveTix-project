/* eslint-disable no-tabs */
const {pool} = require('./sqlconfig.js');

const getTicketInfo = async (ticketId)=>{
  const [ticketInfo] = await pool.query(`SELECT user_id FROM tickets WHERE ticket_id = ?`, ticketId);
  return ticketInfo;
};

const getTicketDetails = async (ticketId)=>{
  const [ticketDetails] = await pool.query(`SELECT t1.ticket_id as ticket_id, DATE_FORMAT(t1.purchase_date, '%Y-%m-%d') as purchase_date, t1.used_status as used_status, t1.price as price, t1.type_name as type_name, t1.ticket_url as ticket_url, t1.qrcode as qrcode, DATE_FORMAT(t1.ticket_start_date,'%Y-%m-%d') as ticket_start_date, DATE_FORMAT(t1.ticket_end_date,'%Y-%m-%d') as ticket_end_date, DATE_FORMAT(t1.verified_time,'%Y-%m-%d') as verified_time, t2.category as category, t2.title as title, t2.city as city, t2.venue as venue from tickets t1 INNER JOIN events t2 ON t1.event_id = t2.event_id WHERE ticket_id = ?`, ticketId);
  return ticketDetails;
};

const checkAndReserveTickets = async (eventId, userId, ticketTypeNameArray, ticketNumberArray)=>{
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    await conn.query('LOCK TABLE tickets WRITE');
    const reservedTickets = [];
    // for each ticket type, loop through ticket number
    for (let i = 0; i < ticketTypeNameArray.length; i++) {
      // adding exclusive lock on selected rows
      const [reservedTicket] = await conn.query(`SELECT ticket_id from tickets WHERE event_id = ? and temp_status = '0' and type_name = ? limit ? FOR UPDATE`, [eventId, ticketTypeNameArray[i], ticketNumberArray[i]]);

      // check locked rows
      const [lockedRows]= await conn.query(`SELECT * FROM performance_schema.data_locks`);

      const tix = [reservedTicket];
      for (let j = 0; j < tix[0].length; j++) {
        reservedTickets.push(tix[0][j].ticket_id);
      };
    };
    await conn.query(`UPDATE tickets SET user_id = ?, timer_timestamp = NOW(), temp_status = '1' WHERE ticket_id IN ?`, [userId, [reservedTickets]]);

    await conn.query('COMMIT'); // lock is released after commit
    await conn.query('UNLOCK TABLES');
    return reservedTickets;
  } catch (error) {
    await conn.query('ROLLBACK');
    return {error};
  } finally {
    await conn.release();
  }
};

const getReservedTicketsType = async (ticketIds) => {
  const [ticketType] = await pool.query(`SELECT type, type_name, count(*) as number FROM tickets WHERE ticket_id IN (?) GROUP BY type, type_name`, [ticketIds]);
  return ticketType;
};

const checkTimerStatus = async (userId, buyTicketsArray)=>{
  // check backend timer does not exceed 5m
  const array = [];
  for (let i = 0; i < buyTicketsArray.result.length; i++) {
    const type = buyTicketsArray.result[i].type;
    const number = buyTicketsArray.result[i].number;
    const [tixWithinCountdown] = await pool.query(`SELECT * FROM tickets WHERE user_id = ? AND type = ? AND DATE_ADD(timer_timestamp, INTERVAL 300 second) >= NOW() LIMIT ?`, [userId, type, number]);
    for (let j = 0; j < tixWithinCountdown.length; j++) {
      const ticketId = tixWithinCountdown[j].ticket_id;
      array.push(ticketId);
    }
  }
  return array;
};

// order: event_id, user_id
// ticket: user_id, purchase_date
const saveTicketOrder = async (eventId, userId, ticketIds)=>{
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');

    // order_query
    const [orderQuery] = await conn.query(`INSERT INTO orders (event_id, user_id) VALUES (?, ?)`, [eventId, userId]);

    const orderId = orderQuery.insertId;

    for (let i = 0; i < ticketIds.length; i++) {
      const ticketId = ticketIds[i];
      await conn.query(`UPDATE tickets SET purchase_date = NOW() WHERE ticket_id = ?`, ticketId);
      await conn.query(`INSERT INTO ticket_order (order_id, ticket_id) VALUES (?, ?)`, [orderId, ticketId]);
    }
    await conn.query('COMMIT');
    await conn.query('UNLOCK TABLES');
    return orderId;
  } catch (error) {
    await conn.query('ROLLBACK');
    return {error};
  } finally {
    await conn.release();
  }
};

const getUserUnusedTicketsForListing = async (userId)=>{
  const [userListedTickets] = await pool.query(`SELECT JSON_ARRAYAGG(ticket_id) as ticket_id FROM listings WHERE user_id = ?`, userId);
  const listedTicketArray = userListedTickets[0].ticket_id;

  let condition;
  if (listedTicketArray != null) {
    condition = ' and ticket_id not in (?)';
  } else {
    condition = '';
  }
  const [unusedTickets] = await pool.query(`SELECT t1.ticket_id as ticket_id, DATE_FORMAT(t1.purchase_date, '%Y-%m-%d') as purchase_date, t1.used_status as used_status, t1.price as price, t1.type_name as type_name, DATE_FORMAT(t1.ticket_start_date,'%Y-%m-%d') as ticket_start_date, DATE_FORMAT(t1.ticket_end_date,'%Y-%m-%d') as ticket_end_date, DATE_FORMAT(t1.verified_time,'%Y-%m-%d') as verified_time, t2.category as category, t2.title as title, t2.city as city, t2.venue as venue from tickets t1 INNER JOIN events t2 ON t1.event_id = t2.event_id WHERE user_id = ? and used_status = '0' and purchase_date is not null${condition}`, [userId, listedTicketArray]);
  return unusedTickets;
};

const updateUsed = async (ticketId, adminId)=>{
  const [ticketUpdated] = await pool.query(`UPDATE tickets SET used_status = '1', verified_id = ?, verified_time = NOW() WHERE ticket_id = ?`, [adminId, ticketId]);
  return ticketUpdated;
};

const saveTicketURLAndQR = async (ticketURL, ticketQR, ticketId)=>{
  const [ticketUpdated] = await pool.query(`UPDATE tickets SET ticket_url = ?, qrcode = ? WHERE ticket_id = ?`, [ticketURL, ticketQR, ticketId]);
  return ticketUpdated;
};

const getVerifiedTickets = async (adminId)=>{
  const [ticketDetails] = await pool.query(`SELECT t1.event_id as event_id, t1.category as category, t1.title as title, DATE_FORMAT(t1.start_date,'%Y-%m-%d') as start_date, DATE_FORMAT(t1.end_date,'%Y-%m-%d') as end_date, t1.city as city, t1.venue as venue, t2.ticket_id as ticket_id, t2.user_id as user_id, DATE_FORMAT(t2.verified_time,'%Y-%m-%d') as verified_time, t2.price as price, t2.type_name as type_name, DATE_FORMAT(t2.ticket_start_date,'%Y-%m-%d') ticket_start_date, DATE_FORMAT(t2.ticket_end_date,'%Y-%m-%d') as ticket_end_date from events t1 INNER JOIN tickets t2 ON t1.event_id = t2.event_id WHERE verified_id = ?`, adminId);
  return ticketDetails;
};

const getSelectedEventTicketTypes = async (eventId)=>{
  const [ticketTypes] = await pool.query(`select distinct type, type_name, DATE_FORMAT(ticket_start_date, '%Y-%m-%d') as ticket_start_date, DATE_FORMAT(ticket_end_date, '%Y-%m-%d') as ticket_end_date from tickets where event_id = ?`, eventId);
  return ticketTypes;
};

const saveExchangeAndListing = async (selectedEventId, selectedTicketType, userId, ticketId)=>{
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');

    let exchangeConditionId;
    // save exchange condition
    const [exchangeSelectQuery] = await conn.query(`SELECT exchange_condition_id FROM exchange_conditions WHERE event_id = ? AND ticket_type = ?`, [selectedEventId, selectedTicketType]);
    if (exchangeSelectQuery.length === 0) {
      const [exchangeInsertQuery] = await conn.query(`INSERT INTO exchange_conditions (event_id, ticket_type) VALUES (?, ?)`, [selectedEventId, selectedTicketType]);
      exchangeConditionId = exchangeInsertQuery.insertId;
    } else {
      exchangeConditionId = exchangeSelectQuery[0].exchange_condition_id;
    }

    // save listing
    const [ticketListing] = await conn.query(`INSERT INTO listings (user_id, ticket_id, exchange_condition_id, listing_status) VALUES (?, ?, ?, 0)`, [userId, ticketId, exchangeConditionId]);
    const listingId = ticketListing.insertId;

    await conn.query('COMMIT');
    return listingId;
  } catch (error) {
    await conn.query('ROLLBACK');
    return {error};
  } finally {
    await conn.release();
  }
};

const getAllCurrentListings = async (userId)=>{
  const [ticketListing] = await pool.query(`SELECT distinct
	  l.listing_id AS listing_id,
    l.ticket_id AS my_ticket_id,
    l.user_id AS my_user_id,
    l.exchange_condition_id AS my_exchange_condition_id,
    i_want.event_id AS i_want_event_id,
    e_i_want.title AS i_want_event_title,
    e_i_want.city AS i_want_event_city,
    e_i_want.venue AS i_want_event_venue,
    t_i_want.type AS i_want_ticket_type,
    t_i_want.type_name AS i_want_ticket_type_name,
    t_mine.event_id AS my_event_id,
    t_mine.type AS my_event_type,
    t_mine.type_name AS my_event_type_name,
    t_mine.price AS my_event_price,
    DATE_FORMAT(t_mine.ticket_start_date,'%Y-%m-%d') AS my_ticket_start_date,
    DATE_FORMAT(t_mine.ticket_end_date,'%Y-%m-%d') AS my_ticket_end_date,
    e_mine.title AS my_event_title,
    e_mine.city AS my_event_city,
    e_mine.venue AS my_event_venue
FROM
    listings l
        INNER JOIN
    exchange_conditions i_want ON l.exchange_condition_id = i_want.exchange_condition_id
		inner join
	events e_i_want ON e_i_want.event_id = i_want.event_id
        inner join
    tickets t_i_want ON e_i_want.event_id = t_i_want.event_id
		and i_want.ticket_type = t_i_want.type
		INNER JOIN
    tickets t_mine on t_mine.ticket_id = l.ticket_id
		inner join
    events e_mine on t_mine.event_id = e_mine.event_id
WHERE
    l.user_id <> ? and t_mine.used_status = '0' and l.listing_status = '0'
ORDER BY
    listing_id`, userId);
  return ticketListing;
};

const getUserCurrentListings = async (userId)=>{
  const [ticketListing] = await pool.query(`SELECT distinct
	l.listing_id AS listing_id,
    l.ticket_id AS my_ticket_id,
    l.user_id AS my_user_id,
    l.exchange_condition_id AS my_exchange_condition_id,
    i_want.event_id AS i_want_event_id,
    e_i_want.title AS i_want_event_title,
    e_i_want.city AS i_want_event_city,
    e_i_want.venue AS i_want_event_venue,
    t_i_want.type AS i_want_ticket_type,
    t_i_want.type_name AS i_want_ticket_type_name,
    t_mine.event_id AS my_event_id,
    t_mine.type AS my_event_type,
    t_mine.type_name AS my_event_type_name,
    t_mine.price AS my_event_price,
    DATE_FORMAT(t_mine.ticket_start_date,'%Y-%m-%d') AS my_ticket_start_date,
    DATE_FORMAT(t_mine.ticket_end_date,'%Y-%m-%d') AS my_ticket_end_date,
    e_mine.title AS my_event_title,
    e_mine.city AS my_event_city,
    e_mine.venue AS my_event_venue
FROM
    listings l
        INNER JOIN
    exchange_conditions i_want ON l.exchange_condition_id = i_want.exchange_condition_id
		inner join
	events e_i_want ON e_i_want.event_id = i_want.event_id
        inner join
    tickets t_i_want ON e_i_want.event_id = t_i_want.event_id
		and i_want.ticket_type = t_i_want.type
		INNER JOIN
    tickets t_mine on t_mine.ticket_id = l.ticket_id
		inner join
    events e_mine on t_mine.event_id = e_mine.event_id
WHERE
    l.user_id = ? and t_mine.used_status = '0' and l.listing_status = '0'
ORDER BY
    listing_id`, userId);
  return ticketListing;
};

const getUserMatchingTicketsForExchange = async (userId, listingId)=>{
  // user tickets unused, listed or unlisted that meet condition
  // return ticket_id, event_id, type, type_name
  // also check current_user_id <> requester user_id
  const [userTickets] = await pool.query(`select t.ticket_id as ticket_id, t.event_id as event_id, e.title as event_title, t.type as type, t.type_name as type_name, l.user_id as poster_user_id, l.ticket_id as poster_ticket_id from listings l
    inner join exchange_conditions ec on l.exchange_condition_id = ec.exchange_condition_id
    inner join tickets t on ec.event_id = t.event_id
    inner join events e on e.event_id = t.event_id
    where l.listing_id = ? and t.user_id = ? and l.user_id <> ? and t.purchase_date is not null and t.used_status = '0'`, [listingId, userId, userId]);
  return userTickets;
};

const executeExchange = async (userId, ticketId, ticketURL, ticketQR, posterUserId, posterTicketId, posterTicketURL, posterTicketQR)=>{
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    await conn.query('LOCK TABLE tickets WRITE, listings WRITE');

    // update tickets: user_id, url, qrcode
    // original B ticket, to A (poster)
    const [ticketExchanged] = await conn.query(`UPDATE tickets SET user_id = ?, ticket_url = ?, qrcode = ? WHERE ticket_id = ?`, [posterUserId, ticketURL, ticketQR, ticketId]);
    const [listingStatus] = await conn.query(`UPDATE listings SET listing_status = '1' WHERE ticket_id = ?`, ticketId);

    // original A (poster) ticket, to B
    const [posterTicketExchanged] = await conn.query(`UPDATE tickets SET user_id = ?, ticket_url = ?, qrcode = ? WHERE ticket_id = ?`, [userId, posterTicketURL, posterTicketQR, posterTicketId]);
    const [posterListingStatus] = await conn.query(`UPDATE listings SET listing_status = '1' WHERE ticket_id = ?`, posterTicketId);

    await conn.query('COMMIT');
    await conn.query('UNLOCK TABLES');
    return posterTicketExchanged;
  } catch (error) {
    await conn.query('ROLLBACK');
    return {error};
  } finally {
    await conn.release();
  }
};

const sendMessage = async (userId, content)=>{
  const [message] = await pool.query(`INSERT INTO messages SET user_id = ?, content = ?, date = NOW(), message_type = 'marketplace'`, [userId, content]);
  return message;
};

module.exports = {getTicketInfo, getTicketDetails, checkAndReserveTickets, getReservedTicketsType, checkTimerStatus, saveTicketOrder, getUserUnusedTicketsForListing, updateUsed, saveTicketURLAndQR, getVerifiedTickets, getSelectedEventTicketTypes, saveExchangeAndListing, getAllCurrentListings, getUserCurrentListings, getUserMatchingTicketsForExchange, executeExchange, sendMessage};
