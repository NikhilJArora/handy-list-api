'use strict';
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto'); // will use randomBytes to create our user salts
const jsonwebtoken = require('jsonwebtoken');
const passport = require('passport'); // Passport used to simplify different types of authentication
const passportLocal = require('passport-local'); // stratergy used when cred's stored locally
var mongoose = require('mongoose');


var USERS_COLLECTION = "users";
var EVENTS_COLLECTION = "events";

var app = express();


var db; //gives access to db outside the connection statement

////////////////// mongodb setup (needs to init. prior to successfully connected prior to server startup...)//////////////
/*App Startup(MongoDB/Express)*/
var mongooseUri = process.env.MONGOLAB_URI || 'mongodb://localhost/handylist-dev';

mongoose.connect(mongooseUri, function (err, res) {
      if (err) {
      console.log ('ERROR connecting to: ' + mongooseUri + '. ' + err);
      } else {
      console.log ('Succeeded connected to: ' + mongooseUri);
      }
    });

//start the Express Web Server:
var server = app.listen(process.env.PORT || 8080, function () {
  var port = server.address().port;
  console.log("Server has started and running on:" + port);
});
/*App Startup(MongoDB/Express)*/

//mongoose schema's(need to require these to clean up my code later!)

//User Schema: (need to org code into toher files...)
var userSchema = new mongoose.Schema({
  email: {type: String, unique: true, required: true},
  name: {
    first : {type: String, required: true},
    last : {type: String, required: true}
  },
  hash: String,
  salt: String
});

//set password for new user/change your password
userSchema.method.setPassword = function setPassword(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

//validate password of existing user inorder to pass then a JWT
userSchema.method.validatePassword = function validatePassword(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
  return hash === this.hash;
};

//** Future **//
// //method to generate jwt which will be returned to an authenticated user
// userSchema.method.createjwt = function createjwt() {
//   var expiryDate = new Date();
// expiryDate.setDate(expiryDate.getDate() + 14);
// //used to create a
// return jwt.sign({
//   _id: this._id,
//   email: this.email,
//   name: this.name,
//   exp: parseInt(expiryDate.getTime() / 1000),
// }, "MY_SECRET"); //TODO: save my secret on my nodejs server as env variable -- Will not store it in source code...
// }

//create model from user schema
var User = mongoose.model('users', userSchema);
//create new user by creating a new instance of the model above ** new User ({...});

/*Express API endpoints:*/

//USERS endpoint:
//USERS post: used to register new users ** pw's never stored in clear text!
//USERS get: used to authenticate users and return a JWT
//USERS put: used to update users information
//USERS delete: removes a user account from storage ... not sure if this will be exposed right way


/*
  POST
  This is the endpoint user to add a user
  params:
   - first_name
   - last_name
   - email
   - password

   return:
    - JWT (to be passed in the Authorization header)
 */


 // USERS API ROUTES BELOW

 // Generic error handler used by all endpoints.
 function handleError(res, reason, message, code) {
   console.log("ERROR: " + reason);
   res.status(code || 500).json({"error": message});
 }

 /*  "/contacts"
  *    GET: finds all contacts
  *    POST: creates a new contact
  */
//endpoint not accessable by user... (only admin endpoint)
 app.get("/users", function(req, res) {
 });

//register new user
 app.post("/users", function(req, res) {
   console.log("recieved request: " + " /users endpoint");
   if (req.body) {
     var user = new User(req.body);
     // Saving it to the database.
     user.save(function (err) {
       if (err){
         res.status(400).json({success : false, message: 'Adding new user failed.'});
       }
       res.status(200).json({success : true, token: '', message: 'user successfully added!'});
     });
   }
   res.status(400).json({success : false, message: 'Request body is empty.'});
 });

 // /*  "/contacts/:id"
 //  *    GET: find contact by id
 //  *    PUT: update contact by id
 //  *    DELETE: deletes contact by id
 //  */
 //
 // app.get("/contacts/:id", function(req, res) {
 // });
 //
 // app.put("/contacts/:id", function(req, res) {
 // });
 //
 // app.delete("/contacts/:id", function(req, res) {
 // });
