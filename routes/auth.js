const express = require('express');
const User = require('../models/User');
const router = express.Router();
require("dotenv").config();
const { body, validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchuser');
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

// ROUTE 1 create a user using :POST "/api/auth/"

router.post('/createuser', [
     body('name', 'Enter a valid name').isLength({ min: 3 }),
     body('email', 'Enter a valid email').isEmail(),
     body('password', 'Password must be atleast 8 characters').isLength({ min: 8 })
], async (req, res) => {
     let success = false;
     // IF there are errors return bad request and errors;
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
          return res.status(400).json({ success, errors: errors.array() });
     }
     // Check wether user exits or not with same email
     try {
          let user = await User.findOne({ email: req.body.email });
          if (user) {
               return res.status(400).json({ success, error: "Sorry a user with this email already exists" });
          }
          const salt = await bcrypt.genSalt(10);
          const secPass = await bcrypt.hash(req.body.password, salt);
          user = await User.create({
               name: req.body.name,
               email: req.body.email,
               password: secPass
          })
          const data = {
               user: {
                    id: user.id
               }
          }
          const authToken = jwt.sign(data, JWT_SECRET)

          success = true;
          res.json({ success, authToken })

     } catch (error) {
          console.error(error.message);
          res.status(500).send("Internal server Error");
     }
})

// ROUTE 2 : Authenticate a user using :POST "/api/auth/login" 

router.post('/login', [
     body('email', 'Enter a valid email').isEmail(),
     body('password', "Password cannot be blank").exists(),
], async (req, res) => {

     const errors = validationResult(req);
     let success = false;
     if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() })
     }

     const { email, password } = req.body;
     try {
          let user = await User.findOne({ email });
          if (!user) {
               return res.status(400).json({
                    success,
                    error:
                         "Please login with correct credentials"
               })
          }

          const passwordToCompare = await bcrypt.compare(password, user.password);

          if (!passwordToCompare) {
               return res.status(400).json({
                    success,
                    error:
                         "Please login with correct credentials"
               })
          }

          const data = {
               user: {
                    id: user.id
               }
          }
          const authToken = jwt.sign(data, JWT_SECRET)
          success = true;
          res.send({ success, authToken });

     } catch (error) {
          console.error(error.message);
          res.status(500).send("Internal server Error")
     }
})

//ROUTE 3: GET LOGGED IN USER DETAILS

router.post('/getuser', fetchUser, async (req, res) => {

     try {
          const userId = req.user.id;
          const user = await User.findById(userId).select("-password")
          res.send(user)
     } catch (error) {
          console.error(error.message);
          res.status(500).send("Internal Server Error!")
     }
})

module.exports = router;