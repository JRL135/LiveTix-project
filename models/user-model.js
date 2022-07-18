const {pool} = require('./sqlconfig.js');

const checkEmail = async (email)=>{
  const [checkEmail] = await pool.query(`SELECT * FROM users WHERE email = ?`, email);
  return checkEmail;
};

const checkUsername = async (name)=>{
  const [checkUsername] = await pool.query(`SELECT * FROM users WHERE name = ?`, name);
  return checkUsername;
};

const registerUser = async (email, name, password, role)=>{
  const [newUser] = await pool.query(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, [name, email, password, role]);
  const userId = newUser.insertId;
  return userId;
};

const getUserUnusedTickets = async (username)=>{
  const [userIdDB] = await pool.query(`SELECT user_id FROM users WHERE name = ?`, username);
  const userId = userIdDB[0].user_id;
  const [registeredEvents] = await pool.query(`SELECT t1.category as category, t1.title as title, DATE_FORMAT(t1.start_date, '%Y-%m-%d') as start_date, DATE_FORMAT(t1.end_date, '%Y-%m-%d') as end_date, t1.city as city, t1.venue as venue, t1.main_picture as main_picture, t2.ticket_id as ticket_id, t2.type_name as ticket_type_name, DATE_FORMAT(t2.purchase_date, '%Y-%m-%d') as purchase_date FROM events t1 INNER JOIN tickets t2 ON t1.event_id = t2.event_id WHERE user_id = ? AND t2.used_status = '0' AND t2.purchase_date is not null ORDER BY purchase_date ASC`, userId);
  return registeredEvents;
};

const getUserUsedTickets = async (username)=>{
  const [userIdDB] = await pool.query(`SELECT user_id FROM users WHERE name = ?`, username);
  const userId = userIdDB[0].user_id;
  const [registeredEvents] = await pool.query(`SELECT t1.category as category, t1.title as title, DATE_FORMAT(t1.start_date, '%Y-%m-%d') as start_date, DATE_FORMAT(t1.end_date, '%Y-%m-%d') as end_date, t1.city as city, t1.venue as venue, t1.main_picture as main_picture, t2.ticket_id as ticket_id, t2.type_name as ticket_type_name, DATE_FORMAT(t2.purchase_date, '%Y-%m-%d') as purchase_date FROM events t1 INNER JOIN tickets t2 ON t1.event_id = t2.event_id WHERE user_id = ? AND t2.used_status = '1' ORDER BY purchase_date ASC`, userId);
  return registeredEvents;
};

const getUserFavEvents = async (username)=>{
  const [favEvents] = await pool.query(`SELECT event_id FROM favorites WHERE user_id IN (SELECT user_id FROM users WHERE name = ?)`, username);
  return favEvents;
};

const getUserMessages = async (userId)=>{
  const [messages] = await pool.query(`SELECT message_id, user_id, content, DATE_FORMAT(date,'%Y-%m-%d') as date, message_type FROM messages WHERE user_id = ? ORDER BY message_id DESC`, userId);
  return messages;
};


module.exports = {checkEmail, checkUsername, registerUser, getUserUnusedTickets, getUserUsedTickets, getUserFavEvents, getUserMessages};
