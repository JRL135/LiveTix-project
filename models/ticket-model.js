// require('dotenv').config();
const {pool} = require('./sqlconfig.js');

const getTicketInfo = async (ticket_id)=>{
    const [ticketInfo] = await pool.query(`SELECT user_id FROM tickets WHERE ticket_id = ?`, ticket_id);
    return ticketInfo;
};

const getTicketDetails = async (ticket_id)=>{
    const [ticketDetails] = await pool.query(`SELECT t1.ticket_id as ticket_id, DATE_FORMAT(t1.purchase_date, '%Y-%m-%d') as purchase_date, t1.used_status as used_status, t1.price as price, t1.type_name as type_name, t1.ticket_url as ticket_url, t1.qrcode as qrcode, DATE_FORMAT(t1.ticket_start_date,'%Y-%m-%d') as ticket_start_date, DATE_FORMAT(t1.ticket_end_date,'%Y-%m-%d') as ticket_end_date, DATE_FORMAT(t1.verified_time,'%Y-%m-%d') as verified_time, t2.category as category, t2.title as title, t2.city as city, t2.venue as venue from tickets t1 INNER JOIN events t2 ON t1.event_id = t2.event_id WHERE ticket_id = ?`, ticket_id);
    return ticketDetails;
};

const getUserUnusedTicketsForListing = async (user_id)=>{
    const [userListedTickets] = await pool.query(`SELECT JSON_ARRAYAGG(ticket_id) as ticket_id FROM listings WHERE user_id = ?`, user_id);
    console.log(userListedTickets);
    let listedTicketArray = userListedTickets[0].ticket_id;
    console.log(listedTicketArray);

    let condition;
    if (listedTicketArray != null) {
        condition = ' and ticket_id not in (?)';
    } else {
        condition = '';
    }
    console.log(condition);
    const [unusedTickets] = await pool.query(`SELECT t1.ticket_id as ticket_id, DATE_FORMAT(t1.purchase_date, '%Y-%m-%d') as purchase_date, t1.used_status as used_status, t1.price as price, t1.type_name as type_name, DATE_FORMAT(t1.ticket_start_date,'%Y-%m-%d') as ticket_start_date, DATE_FORMAT(t1.ticket_end_date,'%Y-%m-%d') as ticket_end_date, DATE_FORMAT(t1.verified_time,'%Y-%m-%d') as verified_time, t2.category as category, t2.title as title, t2.city as city, t2.venue as venue from tickets t1 INNER JOIN events t2 ON t1.event_id = t2.event_id WHERE user_id = ? and used_status = '0' and purchase_date is not null${condition}`, [user_id, listedTicketArray]);
    return unusedTickets;
};

const updateUsed = async (ticket_id, admin_id)=>{
    const [ticketUpdated] = await pool.query(`UPDATE tickets SET used_status = '1', verified_id = ?, verified_time = NOW() WHERE ticket_id = ?`, [admin_id, ticket_id]);
    return ticketUpdated;
}

const saveTicketURLAndQR = async (ticketURL, ticketQR, ticket_id)=>{
    const [ticketUpdated] = await pool.query(`UPDATE tickets SET ticket_url = ?, qrcode = ? WHERE ticket_id = ?`, [ticketURL, ticketQR, ticket_id]);
    return ticketUpdated;
}

const getVerifiedTickets = async (admin_id)=>{
    const [ticketDetails] = await pool.query(`SELECT t1.event_id as event_id, t1.category as category, t1.title as title, DATE_FORMAT(t1.start_date,'%Y-%m-%d') as start_date, DATE_FORMAT(t1.end_date,'%Y-%m-%d') as end_date, t1.city as city, t1.venue as venue, t2.ticket_id as ticket_id, t2.user_id as user_id, DATE_FORMAT(t2.verified_time,'%Y-%m-%d') as verified_time, t2.price as price, t2.type_name as type_name, DATE_FORMAT(t2.ticket_start_date,'%Y-%m-%d') ticket_start_date, DATE_FORMAT(t2.ticket_end_date,'%Y-%m-%d') as ticket_end_date from events t1 INNER JOIN tickets t2 ON t1.event_id = t2.event_id WHERE verified_id = ?`, admin_id);
    return ticketDetails;
};

const getSelectedEventTicketTypes = async (event_id)=>{
    const [ticketTypes] = await pool.query(`select distinct type, type_name, DATE_FORMAT(ticket_start_date, '%Y-%m-%d') as ticket_start_date, DATE_FORMAT(ticket_end_date, '%Y-%m-%d') as ticket_end_date from tickets where event_id = ?`, event_id);
    return ticketTypes;
}  

const saveExchangeAndListing = async (selected_event_id, selected_ticket_type, user_id, ticket_id)=>{
    const conn = await pool.getConnection();
    try {
        console.log('saveExchangeAndListing triggered');
        await conn.query('START TRANSACTION');

        let exchange_condition_id;
        // save exchange condition
        let [exchange_select_query] = await conn.query(`SELECT exchange_condition_id FROM exchange_conditions WHERE event_id = ? AND ticket_type = ?`, [selected_event_id, selected_ticket_type]);
        console.log('===========================');
        console.log(exchange_select_query);
        if (exchange_select_query.length === 0){
            console.log('exchange condition is unique');
            let [exchange_insert_query] = await conn.query(`INSERT INTO exchange_conditions (event_id, ticket_type) VALUES (?, ?)`, [selected_event_id, selected_ticket_type]);
            exchange_condition_id = exchange_insert_query.insertId;
            console.log("exchange_condition_id: " + exchange_condition_id)
        } else {
            console.log('exchange condition already exists');
            exchange_condition_id = exchange_select_query[0].exchange_condition_id;
        }
        console.log("exchange_condition_id: " + exchange_condition_id);

        // save listing
        const [ticketListing] = await conn.query(`INSERT INTO listings (user_id, ticket_id, exchange_condition_id, listing_status) VALUES (?, ?, ?, 0)`, [user_id, ticket_id, exchange_condition_id]);
        let listing_id = ticketListing.insertId;

        await conn.query('COMMIT');
        return listing_id;

    } catch (error) {
        console.log(error);
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
}

const getAllCurrentListings = async (user_id)=>{
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
    l.user_id <> ? and t_mine.used_status = '0'
ORDER BY
    listing_id`, user_id);
    return ticketListing;
}

const getUserCurrentListings = async (user_id)=>{
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
    l.user_id = ? and t_mine.used_status = '0'
ORDER BY
    listing_id`, user_id);
    return ticketListing;
}

const getUserMatchingTicketsForExchange = async (user_id, listing_id)=>{
    console.log("getUserMatchingTicketsForExchange in ticket model");
    // user tickets unused, listed or unlisted that meet condition
    // return ticket_id, event_id, type, type_name
    // also check current_user_id <> requester user_id
    const [userTickets] = await pool.query(`select t.ticket_id as ticket_id, t.event_id as event_id, e.title as event_title, t.type as type, t.type_name as type_name, l.user_id as poster_user_id, l.ticket_id as poster_ticket_id from listings l
    inner join exchange_conditions ec on l.exchange_condition_id = ec.exchange_condition_id
    inner join tickets t on ec.event_id = t.event_id
    inner join events e on e.event_id = t.event_id
    where l.listing_id = ? and t.user_id = ? and l.user_id <> ? and t.purchase_date is not null and t.used_status = '0'`, [listing_id, user_id, user_id]);
    console.log(userTickets);
    return userTickets;
};

const executeExchange = async (user_id, ticket_id, ticketURL, ticketQR, poster_user_id, poster_ticket_id, poster_ticketURL, poster_ticketQR)=>{
    const conn = await pool.getConnection();
    try {
        console.log('executeExchange triggered');
        await conn.query('START TRANSACTION');

        //update tickets: user_id, url, qrcode
        // original B ticket, to A (poster)
        console.log("poster_user_id: " + poster_user_id);
        // console.log(ticketURL);
        // console.log(ticketQR);
        // console.log(ticket_id);
        const [ticketExchanged] = await conn.query(`UPDATE tickets SET user_id = ?, ticket_url = ?, qrcode = ? WHERE ticket_id = ?`, [poster_user_id, ticketURL, ticketQR, ticket_id]);
        console.log(ticketExchanged);

        // original A (poster) ticket, to B
        console.log("user_id: " + user_id);
        // console.log(poster_ticketURL);
        // console.log(poster_ticketQR);
        // console.log(poster_ticket_id);
        const [posterTicketExchanged] = await conn.query(`UPDATE tickets SET user_id = ?, ticket_url = ?, qrcode = ? WHERE ticket_id = ?`, [user_id, poster_ticketURL, poster_ticketQR, poster_ticket_id]);
        console.log(posterTicketExchanged);

        await conn.query('COMMIT');
        return posterTicketExchanged;

    } catch (error) {
        console.log(error);
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
}

const sendMessage = async (user_id, content)=>{
    const [message] = await pool.query(`INSERT INTO messages SET user_id = ?, content = ?, date = NOW(), message_type = 'marketplace'`, [user_id, content]);
    return message;
}

module.exports = { getTicketInfo, getTicketDetails, getUserUnusedTicketsForListing, updateUsed, saveTicketURLAndQR, getVerifiedTickets, getSelectedEventTicketTypes, saveExchangeAndListing, getAllCurrentListings, getUserCurrentListings, getUserMatchingTicketsForExchange, executeExchange, sendMessage };