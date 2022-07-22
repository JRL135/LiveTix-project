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


module.exports = {getEventFavStatus, postEventFavStatus, deleteEventFavStatus, getEventDetails, getEventArtists, getEventDates, getAvailTickets, getCurrentEvents, getCurrentEventsByCategory, getSearchedEvents, getCurrentEventsForExchange};
