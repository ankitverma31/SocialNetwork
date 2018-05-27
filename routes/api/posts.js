const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

//Load post model
const Post = require('../../models/Post');

//Load profile model
const Profile = require('../../models/Profile');

// Load Input Validation(Post)
const validatePostInput = require('../../validation/post');


const router = express.Router();


// @route   GET api/posts/test
// @desc    Tests post route
// @access  public
router.get('/test', (req, res) => res.json({
    msg: "Posts Works"
}));

module.exports = router;

// @route   POST api/posts
// @desc    Create posts
// @access  private
router.post('/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const {
        errors,
        isValid
    } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }
    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then(post => res.json(post));

});


// @route   POST api/posts
// @desc    Get Posts
// @access  Public
router.get('/', (req, res) => {
    Post.find()
        .sort({
            date: -1
        })
        .then(posts => res.json(posts))
        .catch(err => (res.status(404)).json({
            nopostsfound: 'No posts found'
        }));

});

// @route   POST api/posts/:id
// @desc    Get post by id
// @access  Public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => (res.status(404).json({
            nopostfound: 'No post found with that ID'
        })));

});

// @route   DELETE api/posts/:id
// @desc    Delete post by id
// @access  Private
router.delete('/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Profile.findOne({
        user: req.user.id
    }).then(profile => {
        Post.findById(req.params.id).then(post => {
                if (post.user.toString() !== req.user.id) {
                    return res
                        .status(401)
                        .json({
                            notauthorized: 'User Not Authorized'
                        });
                }
                post.remove().then(() => res.json({
                    success: true
                }));
            })
            .catch(err => res.status(404).json({
                postnotfound: 'No post found'
            }));
    });


});