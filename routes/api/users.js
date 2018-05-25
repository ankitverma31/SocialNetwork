const express = require('express');
const request = require('request');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');


const router = express.Router();

// Load User Model
const User = require('../../models/Users');


// @route   GET api/users/test
// @desc    Tests users route
// @access  public
router.get('/test', (req, res) => res.json({
    msg: "Users Works"
}));

// @route   POST api/users/register
// @desc    Register user
// @access  public

router.post('/register', (req, res) => {
    User.findOne({
            email: req.body.email
        })
        .then(user => {
            if (user) {
                return res.status(400).json({
                    email: 'Email already exists'
                });
            } else {

                var profilePicUrl = "http://picasaweb.google.com/data/entry/api/user/" + req.body.email + "?alt=json&fields=gphoto:thumbnail"
                request(profilePicUrl, function (error, response, body) {
                    const avatar = JSON.parse(body).entry.gphoto$thumbnail.$t;
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
                            newUser.save()
                                .then(user => res.json(user))
                                .catch(err => console.log(err));
                        });
                    });
                });


            }
        });
});

// @route   POST api/users/login
// @desc    Login user/ returning token
// @access  public
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // find user by email
    User.findOne({
            email
        })
        .then(user => {
            // check for user
            if (!user) {
                return res.status(404).json({
                    email: 'User not found'
                });
            }

            // Check for password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        //User 
                        const payload = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar
                        } // Create JWT payload
                        // Sign Token
                        jwt.sign(payload, keys.secretOrKey, {
                            expiresIn: 3600
                        }, (err, token) => {
                            res.json({
                                success: true,
                                token: 'Bearer ' + token

                            });

                        });
                    } else {
                        return res.status(404).json({
                            password: "Incorrect Password!"
                        });
                    }
                });
        });

});

module.exports = router;