const JWT = require('jsonwebtoken');
const Ticket = require('../models/ticket-model');
require('dotenv').config({path: '../.env'});

async function checkToken(token) {
  const userInfo = await JWT.verify(token, process.env.jwt_key);
  return userInfo;
}

async function genToken(userId, email, name, role, password) {
  const token = await JWT.sign({id: userId, email: email, name: name, role: role, password: password}, process.env.jwt_key);
  return token;
}

async function checkUserMiddleware(req, res, next) {
  try {
    // check token
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    if (token == 'null') {
      const message = 'No token';
      req.result = message;
    } else {
      const userInfo = await checkToken(token);
      req.result = {
        role: userInfo.role,
        user_id: userInfo.id,
      };
    }
    // return req.result;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}


async function checkIndividualUser(req, res, next) {
  try {
    const userId = req.result.user_id;
    const ticketId = req.params.id;
    const result = await checkTicketUserId(userId, ticketId);
    if (result === 'user_id does not match') {
      return res.status(403).send({
        message: 'Not authorized to access this page',
      });
    }
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function checkTicketUserId(userId, ticketId) {
  try {
    let message;
    const ticketInfo = await Ticket.getTicketInfo(ticketId);
    if (ticketInfo[0].user_id === userId) {
      message = 'user_id matches';
    } else {
      message = 'user_id does not match';
    }
    return message;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
}

async function checkUserRole(req, res, next) {
  try {
    // check token
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    if (token == 'null') {
      const message = 'No token';
      req.result = message;
    } else {
      const userInfo = await checkToken(token);
      req.result = {
        role: userInfo.role,
        user_id: userInfo.id,
      };
    }
    return req.result;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
}

module.exports = {checkToken, genToken, checkUserMiddleware, checkUserRole, checkIndividualUser};
