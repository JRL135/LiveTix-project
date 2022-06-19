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

const checkAndReserveTickets = async (user_id, ticketType, ticketNumber)=>{
    // const [reservedTickets] = await pool.query(`CALL checkAvailTicketsAndreserveTicket(?, ?, ?, @out_ticket_id)`, [user_id, ticketType, ticketNumber]);
    
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        let [reservedTickets] = await conn.query(`SELECT ticket_id from ticket WHERE temp_status = '0' and type = ? limit ?;`, [ticketType, ticketNumber]);
        let ticket_id_array = [];
        for (let i = 0; i < reservedTickets.length; i++) {
            let ticket_id = reservedTickets[i].ticket_id;
            console.log(ticket_id);
            ticket_id_array.push(ticket_id);
            await conn.query(`UPDATE ticket SET user_id = ?, timer_timestamp = NOW(), temp_status = '1' WHERE ticket_id = ?`, [user_id, ticket_id]);
        }
        await conn.query('COMMIT');
        return ticket_id_array;
    } catch (error) {
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
}

const reserveTickets = async ()=>{
    const [reserveTicketsResult] = await pool.query(``);
    return reserveTicketsResult;
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


module.exports = {getEventDetails, getAvailTickets, reserveTickets, checkAndReserveTickets, saveOrder, saveTicket};