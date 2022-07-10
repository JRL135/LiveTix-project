// require('dotenv').config();
const {pool} = require('./sqlconfig.js');

const getTicketInfo = async (ticket_id)=>{
    const [ticketInfo] = await pool.query(`SELECT user_id FROM ticket WHERE ticket_id = ?`, ticket_id);
    return ticketInfo;
};

const getTicketDetails = async (ticket_id)=>{
    const [ticketDetails] = await pool.query(`SELECT t1.ticket_id as ticket_id, DATE_FORMAT(t1.purchase_date, '%Y-%m-%d') as purchase_date, t1.used_status as used_status, t1.price as price, t1.type_name as type_name, t1.ticket_url as ticket_url, t1.qrcode as qrcode, DATE_FORMAT(t1.ticket_start_date,'%Y-%m-%d') as ticket_start_date, DATE_FORMAT(t1.ticket_end_date,'%Y-%m-%d') as ticket_end_date, DATE_FORMAT(t1.verified_time,'%Y-%m-%d') as verified_time, t2.category as category, t2.title as title, t2.city as city, t2.venue as venue from live.ticket t1 INNER JOIN live.event t2 ON t1.event_id = t2.event_id WHERE ticket_id = ?`, ticket_id);
    return ticketDetails;
};

const getUserUnusedTickets = async (user_id)=>{
    const [userListedTickets] = await pool.query(`SELECT JSON_ARRAYAGG(ticket_id) as ticket_id FROM listing WHERE user_id = ?`, user_id);
    console.log(userListedTickets);
    let listedTicketArray = userListedTickets[0].ticket_id;
    console.log(listedTicketArray);

    const [unusedTickets] = await pool.query(`SELECT t1.ticket_id as ticket_id, DATE_FORMAT(t1.purchase_date, '%Y-%m-%d') as purchase_date, t1.used_status as used_status, t1.price as price, t1.type_name as type_name, DATE_FORMAT(t1.ticket_start_date,'%Y-%m-%d') as ticket_start_date, DATE_FORMAT(t1.ticket_end_date,'%Y-%m-%d') as ticket_end_date, DATE_FORMAT(t1.verified_time,'%Y-%m-%d') as verified_time, t2.category as category, t2.title as title, t2.city as city, t2.venue as venue from ticket t1 INNER JOIN event t2 ON t1.event_id = t2.event_id WHERE user_id = ? and used_status = '0' and purchase_date is not null and ticket_id not in (?)`, [user_id, listedTicketArray]);
    return unusedTickets;
};

// const getEventDetailsForTicket = async (ticket_id)=>{
//     const [eventDetails] = await pool.query(`select title, city, venue, DATE_FORMAT(start_date,'%Y-%m-%d') as start_date from event where event_id in (select event_id from live.ticket where ticket_id = ?)`, ticket_id);
//     return eventDetails;
// }


const updateUsed = async (ticket_id)=>{
    const [ticketUpdated] = await pool.query(`UPDATE ticket SET used_status = '1' WHERE ticket_id = ?`, ticket_id);
    return ticketUpdated;
}

const saveTicketURLAndQR = async (ticketURL, ticketQR, ticket_id)=>{
    const [ticketUpdated] = await pool.query(`UPDATE ticket SET ticket_url = ?, qrcode = ? WHERE ticket_id = ?`, [ticketURL, ticketQR, ticket_id]);
    return ticketUpdated;
}

const getVerifiedTickets = async (admin_id)=>{
    const [ticketDetails] = await pool.query(`SELECT t1.event_id as event_id, t1.category as category, t1.title as title, DATE_FORMAT(t1.start_date,'%Y-%m-%d') as start_date, DATE_FORMAT(t1.end_date,'%Y-%m-%d') as end_date, t1.city as city, t1.venue as venue, t2.ticket_id as ticket_id, t2.user_id as user_id, DATE_FORMAT(t2.verified_time,'%Y-%m-%d') as verified_time, t2.price as price, t2.type_name as type_name, DATE_FORMAT(t2.ticket_start_date,'%Y-%m-%d') ticket_start_date, DATE_FORMAT(t2.ticket_end_date,'%Y-%m-%d') as ticket_end_date from event t1 INNER JOIN ticket t2 ON t1.event_id = t2.event_id WHERE verified_id = ?`, admin_id);
    return ticketDetails;
};

const getSelectedEventTicketTypes = async (event_id)=>{
    const [ticketTypes] = await pool.query(`select distinct type, type_name, DATE_FORMAT(ticket_start_date, '%Y-%m-%d') as ticket_start_date, DATE_FORMAT(ticket_end_date, '%Y-%m-%d') as ticket_end_date from live.ticket where event_id = ?`, event_id);
    return ticketTypes;
}  

const saveExchangeAndListing = async (selected_event_id, selected_ticket_type, user_id, ticket_id)=>{
    const conn = await pool.getConnection();
    try {
        console.log('saveExchangeAndListing triggered');
        await conn.query('START TRANSACTION');

        // save exchange condition
        let [exchange_query] = await pool.query(`INSERT INTO exchange_condition (event_id, ticket_type) VALUES (?, ?)`, [selected_event_id, selected_ticket_type]);
        let exchange_condition_id = exchange_query.insertId;
        console.log("exchange_condition_id: " + exchange_condition_id)
        // save listing
        const [ticketListing] = await pool.query(`INSERT INTO listing (user_id, ticket_id, exchange_condition_id) VALUES (?, ?, ?)`, [user_id, ticket_id, exchange_condition_id]);
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

// const saveExchangeCondition = async (selected_event_id, selected_ticket_type)=>{
//     let [exchange_query] = await pool.query(`INSERT INTO exchange_condition (event_id, ticket_type) VALUES (?, ?)`, [selected_event_id, selected_ticket_type]);
//     let exchange_condition_id = exchange_query.insertId;
//     console.log("exchange_condition_id: " + exchange_condition_id)
//     return exchange_condition_id;
// } 

// const saveTicketListing = async (user_id, ticket_id, exchange_condition_id)=>{
//     const [ticketListing] = await pool.query(`INSERT INTO listing (user_id, ticket_id, exchange_condition_id) VALUES (?, ?, ?)`, [user_id, ticket_id, exchange_condition_id]);
//     return ticketListing;
// }

const getCurrentListings = async ()=>{
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
    live.listing l
        INNER JOIN
    live.exchange_condition i_want ON l.exchange_condition_id = i_want.exchange_condition_id
		inner join
	live.event e_i_want ON e_i_want.event_id = i_want.event_id
        inner join
	-- live.ticket t_i_want ON l.ticket_id = t_i_want.ticket_id
    live.ticket t_i_want ON e_i_want.event_id = t_i_want.event_id
		and i_want.ticket_type = t_i_want.type
		INNER JOIN
    ticket t_mine on t_mine.ticket_id = l.ticket_id
		inner join
    live.event e_mine on t_mine.event_id = e_mine.event_id;`);
    return ticketListing;
}

module.exports = { getTicketInfo, getTicketDetails, getUserUnusedTickets, updateUsed, saveTicketURLAndQR, getVerifiedTickets, getSelectedEventTicketTypes, saveExchangeAndListing, getCurrentListings };