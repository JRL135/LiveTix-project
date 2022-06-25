const {pool} = require('./sqlconfig.js');

const checkEmail = async (email)=>{
    const [checkEmail] = await pool.query(`SELECT * FROM user WHERE email = ?`, email);
    return checkEmail;
}

const registerUser = async (email, name, password)=>{
    const [newUser] = await pool.query(`INSERT INTO user (name, email, password) VALUES (?, ?, ?)`, [name, email, password]);
    return newUser;
}

module.exports = { checkEmail, registerUser };