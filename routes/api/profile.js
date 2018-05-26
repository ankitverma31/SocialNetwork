const express = require('express');
const mongoose = require("mongoose");
const passport = require('passport');
const router = express.Router();

//Load profile model
const Profile = require('../../models/Profile');

//Load user model
const User = require('../../models/Users');

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  public
router.get('/test', (req, res) => res.json({
    msg: "Profile Works"
}));

// @route   GET api/profile
// @desc    Get current user profile
// @access  private
router.get('/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const errors = {};
    Profile.findOne({
            user: req.user.id
        })
        .then(profile => {
            if (!profile) {
                errors.noprofile = "There is no profile for this user";
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err))
});

// @route   POST api/profile
// @desc    create/edit user profile
// @access  private
router.get('/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    //Get fields
    const profileFields = {};
    profileFields.user = req.body.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;
    // Skills split into array
    if (typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
    }
    //Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.twitter = req.body.twitter;
    if (req.body.linkedin) profileFields.linkedin = req.body.linkedin;
    if (req.body.facebook) profileFields.facebook = req.body.facebook;
    if (req.body.instagram) profileFields.instagram = req.body.instagram;

    Profile.findOne({
            user: req.user.id
        })
        .then(profile => {
            if (profile) {
                //Update Profile
                Profile.findOneAndUpdate({
                    user: req.user.id
                }, {
                    $set: profileFields
                }, {
                    new: true
                }).then(profile => res.json(profile));
            } else {
                //create profile
                //check if handle exists
                Profile.findOne({
                        handle: profileFields.handle
                    })
                    .then(profile => {
                        if (profile) {
                            errors.handle = 'Username/Handle already exists';
                            res.status(400).json(errors);
                        }
                        // save profile
                        new Profile(profileFields).save().then(profile => res.json(profile));
                    });
            }
        });



});



module.exports = router;