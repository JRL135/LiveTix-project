const User = require('../models/user-model');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
require('dotenv').config({path: '../.env'});

async function registerUser(req, res, next){
    console.log('registerUser triggered');
    try {
        let userInfo = req.body;
        console.log(userInfo);
        let user_id = userInfo.user_id;
        let email = userInfo.email;
        let name = userInfo.username;
        let password = userInfo.password;
        
        // encrypt password
        let salt = await bcrypt.genSalt();
        let hashed_password = await bcrypt.hash(password, salt);
        password = hashed_password;
        // check if email exists
        let emailCheck = await User.checkEmail(email);
        if (emailCheck.length === 0) {
            let createNewUser = await User.registerUser(email, name, password);
            console.log("new user created");
            // gen JWT token for new user
            let token = await genToken(user_id, email, name, password);
            console.log(token);
            req.result = token;
        } else {
            console.log("email already exists");
            let message = "Email already exists";
            req.result = message;
            // res.status(409).send({message: "Email already exists"});
        }
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

async function loginUser(req, res, next){
    console.log("loginUser triggered");
    try {
        let userInfo = req.body;
        console.log(userInfo);
        let email = userInfo.email;
        let password = userInfo.password;
        // check password
        let existingUser = await User.checkEmail(email);
        console.log(existingUser);
        let user_id = existingUser[0].user_id;
        let name = existingUser[0].name;
        let hashed_password = existingUser[0].password;
        let role = existingUser[0].role;
        const match = await bcrypt.compare(password, hashed_password);
        if (match) {
            console.log("password check ok");
            let token = await genToken(user_id, email, name, role, hashed_password);
            console.log(token);
            req.result = token;
        } else {
            console.log("password check failed");
            let message = "Email or password does not match";
            req.result = message;
        }
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();

}

async function getUserProfile(req, res, next){
    console.log('getUserProfile triggered');
    try {
        //check token
        const authHeader = req.headers.authorization;
        console.log(authHeader);
        let token = authHeader.split(' ')[1];
        let userInfo = await checkToken(token);
        console.log(userInfo);
        req.result = userInfo;

    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

async function checkAdmin(req, res, next){
    console.log('checkAdmin triggered');
    try {
        //check token
        const authHeader = req.headers.authorization;
        console.log(authHeader);
        let token = authHeader.split(' ')[1];
        let userInfo = await checkToken(token);
        if (userInfo.role === 'admin'){
            req.result = 'admin';
        } else {
            req.result = 'user';
        }
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

async function getUserRegisteredEvents(req, res, next){
    console.log('getUserRegisteredEvents triggered');
    try {
        let username = req.params.username;
        console.log(username);
        let registeredEvents = await User.getRegisteredEvents(username);
        console.log(registeredEvents);
        req.result = registeredEvents;

    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}


async function checkToken(token){
    let userInfo = await JWT.verify(token, process.env.jwt_key);
    return userInfo;
}

async function genToken(user_id, email, name, role, password){
    let token = await JWT.sign({id: user_id, email: email, name: name, role: role, password: password}, process.env.jwt_key);
    return token;
}


module.exports = { registerUser, loginUser, getUserProfile, checkToken, checkAdmin, getUserRegisteredEvents };