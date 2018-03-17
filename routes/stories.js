const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');

const Story = mongoose.model('stories');

router.get('/', (req, res) => {
    Story.find({
        status: 'public'
    })
    .populate('user')
    .then(stories => {
        res.render('stories/index', stories);    
    })
});

router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('stories/add');
});

router.post('/', ensureAuthenticated, (req, res) => {
    let allowComments;

    if (req.body.allowComments) {
        allowComments = true;
    } else {
        allowComments = false;
    }

    const newStory = {
        title: req.body.title,
        body: req.body.body,
        status: req.body.status,
        allowComments: allowComments,
        user: req.user.id
    }

    new Story(newStory)
        .save()
        .then(story => {
            res.redirect(`/stories/${story.id}`);
        })
        .catch(err => {
            console.log(err);
        });

})

module.exports = router;