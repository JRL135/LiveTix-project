const User = require('../models/user-model');
const Event = require('../models/event-model');
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
        let role = 'user';
        
        // encrypt password
        let salt = await bcrypt.genSalt();
        let hashed_password = await bcrypt.hash(password, salt);
        password = hashed_password;
        // check if email exists
        let emailCheck = await User.checkEmail(email);
        if (emailCheck.length === 0) {
            let createNewUser = await User.registerUser(email, name, password, role);
            console.log("new user created");
            // gen JWT token for new user
            let token = await genToken(user_id, email, name, role, password);
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
        let userInfo;
        const authHeader = req.headers.authorization;
        console.log(authHeader);
        let token = authHeader.split(' ')[1];
        console.log(token);
        if (token == 'null') {
            console.log("missing token, block profile access");
            userInfo = "No token";
        } else {
            userInfo = await checkToken(token);
            console.log(userInfo);
        }
        req.result = userInfo;

    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}



async function checkUserMiddleware(req, res, next){
    console.log('checkUserMiddleware triggered');
    try {
        //check token
        let authHeader = req.headers.authorization;
        console.log(authHeader);
        let token = authHeader.split(' ')[1];
        if (token == 'null') {
            console.log("Missing token");
            let message = "No token";
            req.result = message;
        } else {
            let userInfo = await checkToken(token);
            req.result = {
                role: userInfo.role,
                user_id: userInfo.id
            };
        }
        console.log(req.result);
        // return req.result;
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

async function getUserFavEvents(req, res, next){
    console.log('getUserFavEvents triggered');
    try {
        let username = req.params.username;
        console.log(username);
        let favEvents = await User.getUserFavEvents(username); //return event_id array
        console.log(favEvents);
        let events = [];
        for (let i = 0; i < favEvents.length; i++){
            let event_id = favEvents[i].event_id;
            let eventDetails = await Event.getEventDetails(event_id);
            events.push(eventDetails);
        }
        console.log(events);
        req.result = events;
    }catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

async function getUserMessages(req, res, next){
    console.log('getUserMessages triggered');
    try {
        let user_id = req.params.id;
        console.log(user_id);
        let userMessages = await User.getUserMessages(user_id);
        console.log(userMessages);
        req.result = userMessages;
    }catch(err) {
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


module.exports = { registerUser, loginUser, getUserProfile, checkToken, checkUserMiddleware, getUserRegisteredEvents, getUserFavEvents, getUserMessages };