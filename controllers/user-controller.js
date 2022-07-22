const User = require('../models/user-model');
const Event = require('../models/event-model');
const Auth = require('../utils/auth');
const bcrypt = require('bcrypt');

require('dotenv').config({path: '../.env'});

async function registerUser(req, res, next) {
  console.log('registerUser triggered');
  try {
    const userInfo = req.body;
    console.log(userInfo);
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
      console.log('new user created');
      // gen JWT token for new user
      const token = await Auth.genToken(userId, email, name, role, password);
      // console.log(token);
      req.result = {
        status: 1,
        message: 'Thank you for signing up!',
        token: token,
      };
    } else if (emailCheck.length === 0 && usernameCheck.length > 0) {
      console.log('Username already exists');
      req.result = {
        status: 0,
        message: 'Username already exists.',
      };
    } else if (emailCheck.length > 0 && usernameCheck.length === 0) {
      console.log('Email already exists');
      req.result = {
        status: 0,
        message: 'Email already exists.',
      };
    } else if (emailCheck.length > 0 && usernameCheck.length > 0) {
      console.log('Email and username already exist');
      req.result = {
        status: 0,
        message: 'Email and username already exist.',
      };
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function loginUser(req, res, next) {
  console.log('loginUser triggered');
  try {
    const userInfo = req.body;
    console.log(userInfo);
    const email = userInfo.email;
    const password = userInfo.password;
    // check password
    const existingUser = await User.checkEmail(email);
    console.log(existingUser);
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
        console.log('password check ok');
        const token = await Auth.genToken(userId, email, name, role, hashedPassword);
        req.result = {
          status: 1,
          message: 'Welcome back!',
          token: token,
        };
      } else {
        console.log('password check failed');
        req.result = {
          status: 0,
          message: 'Email and password do not match.',
        };
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getUserProfile(req, res, next) {
  console.log('getUserProfile triggered');
  try {
    // check token
    let userInfo;
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    const token = authHeader.split(' ')[1];
    console.log(token);
    if (token == 'null') {
      console.log('missing token, block profile access');
      userInfo = 'No token';
    } else {
      userInfo = await Auth.checkToken(token);
      console.log(userInfo);
    }
    req.result = userInfo;
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}


async function getUserUnusedTickets(req, res, next) {
  console.log('getUserUnusedTickets triggered');
  try {
    const username = req.params.username;
    console.log(username);
    const unusedTickets = await User.getUserUnusedTickets(username);
    console.log(unusedTickets);
    req.result = unusedTickets;
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getUserUsedTickets(req, res, next) {
  console.log('getUserUsedTickets triggered');
  try {
    const username = req.params.username;
    console.log(username);
    const usedTickets = await User.getUserUsedTickets(username);
    console.log(usedTickets);
    req.result = usedTickets;
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getUserFavEvents(req, res, next) {
  console.log('getUserFavEvents triggered');
  try {
    const username = req.params.username;
    console.log(username);
    const favEvents = await User.getUserFavEvents(username); // return event_id array
    console.log(favEvents);
    const events = [];
    for (let i = 0; i < favEvents.length; i++) {
      const eventId = favEvents[i].event_id;
      const eventDetails = await Event.getEventDetails(eventId);
      events.push(eventDetails);
    }
    console.log(events);
    req.result = events;
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}

async function getUserMessages(req, res, next) {
  console.log('getUserMessages triggered');
  try {
    const userId = req.params.id;
    console.log(userId);
    const userMessages = await User.getUserMessages(userId);
    console.log(userMessages);
    req.result = userMessages;
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err.message});
  }
  await next();
}


module.exports = {registerUser, loginUser, getUserProfile, getUserUnusedTickets, getUserUsedTickets, getUserFavEvents, getUserMessages};
