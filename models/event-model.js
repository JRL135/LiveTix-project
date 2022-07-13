const {pool} = require('./sqlconfig.js');


const getEventFavStatus = async (event_id, user_id)=>{
    const [eventFavStatus] = await pool.query(`SELECT * FROM favorites WHERE event_id = ? AND user_id = ?`, [event_id, user_id]);
    return eventFavStatus;
};

const postEventFavStatus = async (event_id, user_id)=>{
    const [eventFavStatus] = await pool.query(`INSERT INTO favorites (event_id, user_id) VALUES(?, ?)`, [event_id, user_id]);
    return eventFavStatus;
};

const deleteEventFavStatus = async (event_id, user_id)=>{
    const [eventFavStatus] = await pool.query(`DELETE FROM favorites WHERE event_id = ? AND user_id = ?`, [event_id, user_id]);
    return eventFavStatus;
};

const getEventDetails = async (id)=>{
    const [eventDetails] = await pool.query(`SELECT * FROM events WHERE event_id = ?`, id);
    return eventDetails;
};

const getEventArtists = async (id)=>{
    const [eventArtists] = await pool.query(`SELECT artist_name FROM artists WHERE artist_id IN (SELECT artist_id FROM artist_event WHERE event_id = ?);`, id);
    return eventArtists;
}

const getEventDates = async (id)=>{
    const [eventDates] = await pool.query(`SELECT start_date, end_date FROM events WHERE event_id = ?`, id);
    return eventDates;
}

const getAvailTickets = async (id)=>{
    const [availTickets] = await pool.query(`SELECT ticket_id, type, price, type_name FROM tickets WHERE event_id = ? AND temp_status = '0'`, id);
    return availTickets;
};

const checkAndReserveTickets = async (event_id, user_id, ticketTypeName, ticketNumber)=>{
    // const [reservedTickets] = await pool.query(`CALL checkAvailTicketsAndreserveTicket(?, ?, ?, @out_ticket_id)`, [user_id, ticketType, ticketNumber]);
    
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        let [reservedTickets] = await conn.query(`SELECT ticket_id from tickets WHERE event_id = ? and temp_status = '0' and type_name = ? limit ?`, [event_id, ticketTypeName, ticketNumber]);
        let ticket_id_array = [];
        for (let i = 0; i < reservedTickets.length; i++) {
            let ticket_id = reservedTickets[i].ticket_id;
            console.log(ticket_id);
            ticket_id_array.push(ticket_id);
            await conn.query(`UPDATE tickets SET user_id = ?, timer_timestamp = NOW(), temp_status = '1' WHERE ticket_id = ?`, [user_id, ticket_id]);
        }
        await conn.query('COMMIT');
        return ticket_id_array;
    } catch (error) {
        console.log(error);
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
}

const checkTimerStatus = async (ticket_ids)=>{
    console.log("checking ticket timer");
    // check backend timer does not exceed 10m
    let array = [];
    for (let i = 0; i < ticket_ids.length; i++) {
        let ticket_id = ticket_ids[i];
        let [tixWithinCountdown] = await pool.query(`SELECT * FROM tickets WHERE ticket_id =? AND DATE_ADD(timer_timestamp, INTERVAL 300 second) >= NOW()`, ticket_id);
        console.log(tixWithinCountdown);
        
        if (tixWithinCountdown.length === 0) {
            console.log(`tixWithinCountdown is empty, countdown has timed out for ticket_id: ${ticket_id}`);
            [status_update] = await pool.query(`UPDATE tickets SET temp_status = '0' AND timer_timestamp = null WHERE ticket_id = ?`, ticket_id);
            let tempObj = {};
            tempObj.expired = ticket_id;
            array.push(tempObj);
        }
        else {
            console.log("timer has not expired, returning tixWithinCountdown");
            let tempObj = {};
            tempObj.ok = ticket_id;
            array.push(tempObj);
            // return tixWithinCountdown; // if within timer limit, return ticket_ids back
        }
        // if (tixWithinCountdown_content === "") {
        //     let [status_update] = await pool.query(`UPDATE tickets SET temp_status = '0' AND timer_timestamp = null WHERE ticket_id = ?`, ticket_id);
        //     status_update_array.push(status_update);
        // }
    }
    return array;
}

//order: event_id, user_id
//ticket: user_id, purchase_date
const saveTicketOrder = async (event_id, user_id, ticket_ids)=>{
    const conn = await pool.getConnection();
    try {
        console.log("saveTicketOrder in model try catch");
        console.log(event_id);
        console.log(user_id);
        await conn.query('START TRANSACTION');


        // order_query
        let [order_query] = await conn.query(`INSERT INTO orders (event_id, user_id) VALUES (?, ?)`, [event_id, user_id]);
        console.log(typeof(order_query));
        console.log(order_query);
        
        
        let order_id = order_query.insertId;
        console.log("order_id in model:");
        console.log(order_id);


        for (let i = 0; i < ticket_ids.length; i++) {
            let ticket_id = ticket_ids[i];
            await conn.query(`UPDATE tickets SET purchase_date = NOW() WHERE ticket_id = ?`, ticket_id);
            
            
            // console.log("updated ticket table for purchase");
            await conn.query(`INSERT INTO ticket_order (order_id, ticket_id) VALUES (?, ?)`, [order_id, ticket_id]);
            // console.log("inserted into ticket_order table");
        }
        await conn.query('COMMIT');
        return order_id;


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


//search querie
const getSearchedEvents = async (keyword, category, city, start_date, end_date)=>{
    let category_condition;
    if (category != 0) {
        category_condition = 'and';
    } else {
        category_condition = 'or';
    }
    let city_condition;
    if (city != 0) {
        city_condition = 'and';
    } else {
        city_condition = 'or';
    }
    const [searchedEvents] = await pool.query(`SELECT * FROM events WHERE (title LIKE ?) AND (category = ? ${category_condition} category IS NOT NULL) AND (city = ? ${city_condition} city IS NOT NULL) AND (start_date BETWEEN ? AND ? OR ? BETWEEN start_date AND end_date) ORDER BY start_date ASC`, [`%${keyword}%`, `${category}`, `${city}`, `${start_date}`, `${end_date}`, `${start_date}`]);
    return searchedEvents;
};


//ticket-listing queries
// const getCurrentEventsForExchange = async ()=>{
//     const [currentEvents] = await pool.query(`SELECT DISTINCT t1.event_id as event_id, t1.title as title, t2.type as type, t2.type_name as type_name, DATE_FORMAT(t2.ticket_start_date,'%Y-%m-%d') as ticket_start_date, DATE_FORMAT(t2.ticket_end_date,'%Y-%m-%d') as ticket_end_date from event t1 INNER JOIN ticket t2 ON t1.event_id = t2.event_id;`);
//     return currentEvents;
// };

const getCurrentEventsForExchange = async ()=>{
    const [currentEvents] = await pool.query(`SELECT * FROM events WHERE end_date >= CURDATE()`);
    return currentEvents;
};


module.exports = { getEventFavStatus, postEventFavStatus, deleteEventFavStatus, getEventDetails, getEventArtists, getEventDates, getAvailTickets, checkAndReserveTickets, checkTimerStatus, saveTicketOrder, getCurrentEvents, getCurrentEventsByCategory, getSearchedEvents, getCurrentEventsForExchange };