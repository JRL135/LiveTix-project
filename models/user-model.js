const {pool} = require('./sqlconfig.js');

const checkEmail = async (email)=>{
    const [checkEmail] = await pool.query(`SELECT * FROM user WHERE email = ?`, email);
    return checkEmail;
}

const registerUser = async (email, name, password)=>{
    const [newUser] = await pool.query(`INSERT INTO user (name, email, password) VALUES (?, ?, ?)`, [name, email, password]);
    return newUser;
}

const getRegisteredEvents = async (username)=>{
    const [registeredEvents] = await pool.query(`SELECT category, title, start_date, end_date, city, avenue, main_picture, ticket_id FROM event t1 INNER JOIN ticket t2 ON t1.event_id = t2.event_id INNER JOIN user t3 ON t2.user_id = t3.user_id WHERE t3.name = ?`, username);
    return registeredEvents;
}

const getUserFavEvents = async (username)=>{
    const [favEvents] = await pool.query(`SELECT event_id FROM favorite WHERE user_id IN (SELECT user_id FROM user WHERE name = ?)`, username);
    return favEvents;
};


module.exports = { checkEmail, registerUser, getRegisteredEvents, getUserFavEvents };