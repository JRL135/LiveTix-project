const User = require('../models/user-model');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
require('dotenv').config({path: '../.env'});

async function registerUser(req, res, next){
    console.log('registerUser triggered');
    try {
        let userInfo = req.body;
        console.log(userInfo);
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
            let token = await genToken(email, name, password);
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
        let name = existingUser[0].name;
        let hashed_password = existingUser[0].password;
        const match = await bcrypt.compare(password, hashed_password);
        if (match) {
            console.log("password check ok");
            let token = await genToken(email, name, hashed_password);
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

async function genToken(email, name, password){
    let token = await JWT.sign({email: email, name: name, password: password}, process.env.jwt_key);
    return token;
}


module.exports = { registerUser, loginUser };