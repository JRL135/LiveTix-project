const JWT = require('jsonwebtoken');
const Ticket = require('../models/ticket-model');
require('dotenv').config({path: '../.env'});

async function checkIndividualUser(req, res, next) {
  console.log('checkIndividualUser triggered');
  try {
    const userId = req.result.user_id;
    console.log('userId: ' + userId);
    const ticketId = req.params.id;
    console.log('ticketId: ' + ticketId);
    const result = await checkTicketUserId(userId, ticketId);
    console.log(result);
    if (result === 'user_id does not match') {
      return res.status(403).send({
        message: 'Not authorized to access this page',
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function checkTicketUserId(userId, ticketId) {
  console.log('getTicketUserId triggered');
  try {
    console.log('userId: ' + userId);
    let message;
    console.log('ticketId: ' + ticketId);
    const ticketInfo = await Ticket.getTicketInfo(ticketId);
    console.log(ticketInfo);
    if (ticketInfo[0].user_id === userId) {
      message = 'user_id matches';
    } else {
      message = 'user_id does not match';
    }
    console.log(message);
    return message;
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
}

async function checkUserRole(req, res, next) {
  console.log('checkUserRole triggered');
  try {
    // check token
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    const token = authHeader.split(' ')[1];
    if (token == 'null') {
      console.log('Missing token');
      const message = 'No token';
      req.result = message;
    } else {
      const userInfo = await checkToken(token);
      req.result = {
        role: userInfo.role,
        user_id: userInfo.id,
      };
    }
    console.log(req.result);
    return req.result;
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
}

async function checkToken(token) {
  const userInfo = await JWT.verify(token, process.env.jwt_key);
  return userInfo;
}

module.exports = {checkUserRole, checkIndividualUser};
