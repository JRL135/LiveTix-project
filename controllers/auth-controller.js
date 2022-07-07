const JWT = require('jsonwebtoken');
const Ticket = require('../models/ticket-model');
require('dotenv').config({path: '../.env'});

async function checkIndividualUser(req, res, next){
    console.log('checkIndividualUser triggered');
    try {
        let user_id = req.result.user_id;
        console.log("user_id: " + user_id);
        let ticket_id = req.params.id;
        console.log("ticket_id: " + ticket_id);
        let result = await checkTicketUserId(user_id, ticket_id);
        console.log(result); //result = 'user_id matches'
        if (result === 'user_id does not match'){
            return res.status(403).send({
                message: 'Not authorized to access this page'
            });
        } 
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    await next();
}

async function checkTicketUserId(user_id, ticket_id){
    console.log("getTicketUserId triggered");
    try {
        console.log("user_id: " + user_id);
        let message;
        console.log("ticket_id: " + ticket_id);
        let ticketInfo = await Ticket.getTicketInfo(ticket_id);
        console.log(ticketInfo);
        if (ticketInfo[0].user_id === user_id){
            message = 'user_id matches';
        } else {
            message = 'user_id does not match';
        }
        console.log(message);
        return message;
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
}

async function checkUserRole(req, res, next){
    console.log('checkUserRole triggered');
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
        return req.result;
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
    // await next();
}

async function checkToken(token){
    let userInfo = await JWT.verify(token, process.env.jwt_key);
    return userInfo;
}

module.exports = { checkUserRole, checkIndividualUser };