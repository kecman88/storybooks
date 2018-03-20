const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');

const Story = mongoose.model('stories');

router.get('/', (req, res) => {
    Story.find({
        status: 'public'
    })
    .sort({
        date: 'desc'
    })
    .populate('user')
    .then(stories => {
        res.render('stories/index', {
            stories: stories
        });    
    });
});

router.get('/show/:id', (req, res) => {
    Story.findOne({
        _id: req.params.id
    })
    .populate('user')
    .populate('comments.commentUser')
    .then(story => {
        res.render('stories/show', {
            story: story
        })
    });
});

router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('stories/add');
});

router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Story.findOne({
        _id: req.params.id
    })
    .then(story => {
        if (story.user != req.user.id) {
            res.redirect('/stories');
        } else {
            res.render('stories/edit', {
                story: story
            })
        }
    });
});

router.put('/:id', (req, res) => {
    Story.findOne({
        _id: req.params.id
    })
    .then(story => {
        let allowComments;

        if (req.body.allowComments) {
            allowComments = true;
        } else {
            allowComments = false;
        }

        // new values from form
        story.title = req.body.title;
        story.body = req.body.body;
        story.status = req.body.status;
        story.allowComments = allowComments;

        story.save()
            .then(story => {
                res.redirect('/dashboard');
            });
        
    });
});

router.delete('/:id', ensureAuthenticated, (req, res) => {
    Story.remove({
        _id: req.params.id
    }).then(() => {
        res.redirect('/dashboard');
    })
});

// Add new story
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

// Add comment
router.post('/:id/comment', (req, res) => {
    Story.findOne({
        _id: req.params.id
    }).then(story => {
        const newComment = {
            commentBody: req.body.commentBody,
            commentUser: req.user.id
        }
        // add to comments 
        story.comments.unshift(newComment);
        story.save()
            .then(story => {
                res.redirect(`/stories/show/${story.id}`);
            });
    });
});

module.exports = router;