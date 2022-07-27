const User = require('../models/user-model');
const Event = require('../models/event-model');
const Auth = require('../utils/auth');
const bcrypt = require('bcrypt');

require('dotenv').config({path: '../.env'});

async function registerUser(req, res, next) {
  try {
    const userInfo = req.body;
    let userId;
    const email = userInfo.email;
    const name = userInfo.username;
    let password = userInfo.password;
    const role = 'user';

    // encrypt password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    password = hashedPassword;
    // check if email or username exist
    const emailCheck = await User.checkEmail(email);
    const usernameCheck = await User.checkUsername(name);
    if (emailCheck.length === 0 && usernameCheck.length === 0) {
      userId = await User.registerUser(email, name, password, role);
      // gen JWT token for new user
      const token = await Auth.genToken(userId, email, name, role, password);
      req.result = {
        status: 1,
        message: 'Thank you for signing up!',
        token: token,
      };
    } else if (emailCheck.length === 0 && usernameCheck.length > 0) {
      req.result = {
        status: 0,
        message: 'Username already exists.',
      };
    } else if (emailCheck.length > 0 && usernameCheck.length === 0) {
      req.result = {
        status: 0,
        message: 'Email already exists.',
      };
    } else if (emailCheck.length > 0 && usernameCheck.length > 0) {
      req.result = {
        status: 0,
        message: 'Email and username already exist.',
      };
    }
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function loginUser(req, res, next) {
  try {
    const userInfo = req.body;
    const email = userInfo.email;
    const password = userInfo.password;
    // check password
    const existingUser = await User.checkEmail(email);
    if (existingUser.length === 0) {
      req.result = {
        status: 0,
        message: 'Email does not exist.',
      };
    } else {
      const userId = existingUser[0].user_id;
      const name = existingUser[0].name;
      const hashedPassword = existingUser[0].password;
      const role = existingUser[0].role;
      const match = await bcrypt.compare(password, hashedPassword);
      if (match) {
        const token = await Auth.genToken(userId, email, name, role, hashedPassword);
        req.result = {
          status: 1,
          message: 'Welcome back!',
          token: token,
        };
      } else {
        req.result = {
          status: 0,
          message: 'Email and password do not match.',
        };
      }
    }
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getUserProfile(req, res, next) {
  try {
    // check token
    let userInfo;
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    if (token == 'null') {
      userInfo = 'No token';
    } else {
      userInfo = await Auth.checkToken(token);
    }
    req.result = userInfo;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}


async function getUserUnusedTickets(req, res, next) {
  try {
    const username = req.params.username;
    const unusedTickets = await User.getUserUnusedTickets(username);
    req.result = unusedTickets;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getUserUsedTickets(req, res, next) {
  try {
    const username = req.params.username;
    const usedTickets = await User.getUserUsedTickets(username);
    req.result = usedTickets;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getUserFavEvents(req, res, next) {
  try {
    const username = req.params.username;
    const favEvents = await User.getUserFavEvents(username); // return event_id array
    const events = [];
    for (let i = 0; i < favEvents.length; i++) {
      const eventId = favEvents[i].event_id;
      const eventDetails = await Event.getEventDetails(eventId);
      events.push(eventDetails);
    }
    req.result = events;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getUserMessages(req, res, next) {
  try {
    const userId = req.params.id;
    const userMessages = await User.getUserMessages(userId);
    req.result = userMessages;
  } catch (err) {
    res.status(500).send({error: err.message});
  }
  await next();
}


module.exports = {registerUser, loginUser, getUserProfile, getUserUnusedTickets, getUserUsedTickets, getUserFavEvents, getUserMessages};
