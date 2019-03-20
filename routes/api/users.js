const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");

//Load User model
const User = require("../../models/User");

//@Route GET api/users/test
//@Desc Test user route
//@access Public
router.get("/test", (req, res) => res.json({ msg: "user works" }));

//@Route GET api/users/register
//@Desc User registeration
//@access Public
router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exist" });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //Size
        r: "pg", //rating
        d: "mm" //Default Picture
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

//@Route GET api/users/login
//@Desc User Login / return JWT-Token
//@access Public
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email })
    .then(user => {
      //check for user
      if (!user) {
        return res.status(404).json({ email: "User not found" });
      }

      //Check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          res.json({ msg: "success" });
        } else {
          return res.status(400).json({ passowrd: "Password incorrect" });
        }
      });
    })
    .catch(err => console.log(err));
});

module.exports = router;
