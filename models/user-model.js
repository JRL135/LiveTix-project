const {pool} = require('./sqlconfig.js');

const checkEmail = async (email)=>{
    const [checkEmail] = await pool.query(`SELECT * FROM users WHERE email = ?`, email);
    return checkEmail;
}

const registerUser = async (email, name, password, role)=>{
    const [newUser] = await pool.query(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, [name, email, password, role]);
    let user_id = newUser.insertId;
    return user_id;
}

const getRegisteredEvents = async (username)=>{
    const [userId] = await pool.query(`SELECT user_id FROM users WHERE name = ?`, username);
    let user_id = userId[0].user_id;
    const [registeredEvents] = await pool.query(`SELECT t1.category as category, t1.title as title, t1.start_date as start_date, t1.end_date as end_date, t1.city as city, t1.venue as venue, t1.main_picture as main_picture, t2.ticket_id as ticket_id, t2.purchase_date as purchase_date FROM events t1 INNER JOIN tickets t2 ON t1.event_id = t2.event_id WHERE user_id = ? ORDER BY purchase_date ASC`, user_id);
    return registeredEvents;
}

const getUserFavEvents = async (username)=>{
    const [favEvents] = await pool.query(`SELECT event_id FROM favorites WHERE user_id IN (SELECT user_id FROM users WHERE name = ?)`, username);
    return favEvents;
};

const getUserMessages = async (user_id)=>{
    const [messages] = await pool.query(`SELECT message_id, user_id, content, DATE_FORMAT(date,'%Y-%m-%d') as date, message_type FROM messages WHERE user_id = ? ORDER BY message_id DESC`, user_id);
    return messages;
};


module.exports = { checkEmail, registerUser, getRegisteredEvents, getUserFavEvents, getUserMessages };