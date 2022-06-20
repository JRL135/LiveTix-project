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
        let [reservedTickets] = await conn.query(`SELECT ticket_id from ticket WHERE temp_status = '0' and type = ? limit ?`, [ticketType, ticketNumber]);
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
        console.log(error);
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
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
        let [order_query] = await conn.query(`INSERT INTO live.order (event_id, user_id) VALUES (?, ?)`, [event_id, user_id]);
        console.log(typeof(order_query));
        console.log(order_query);
        let order_id = order_query.insertId;
        console.log("order_id in model:");
        console.log(order_id);
        for (let i = 0; i < ticket_ids.length; i++) {
            let ticket_id = ticket_ids[i];
            await conn.query(`UPDATE ticket SET purchase_date = NOW() WHERE ticket_id = ?`, ticket_id);
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






const saveTicket = async (user_id, ticket_id)=>{
    const [ticket] = await pool.query(`UPDATE ticket SET user_id = ?, purchase_date = NOW() WHERE ticket_id = ?`, user_id);
    return ticket;
};

//insert ticket_order table


module.exports = {getEventDetails, getAvailTickets, checkAndReserveTickets, saveTicketOrder};