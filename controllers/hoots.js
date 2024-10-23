// controllers/hoots.js

const express = require('express');
const router = express.Router();


// Model
const Hoot = require('../models/hoot.js');


// Middleware
const verifyToken = require('../middleware/verify-token.js');
const { sendError, NotFound, Forbidden } = require('../utils/errors')

//!--- Public and Private Routes

// ========== Public Routes =========== above router.use(varifyToken)




// ========= Protected Routes =========  under router.use(varifyToken)

//!--- Verify Token Middleware
router.use(verifyToken);

//!--- Create Hoot
router.post('/', async (req, res) => {
    try {
        req.body.author = req.user._id;
        const hoot = await Hoot.create(req.body);
        hoot._doc.author = req.user;
        return res.status(201).json(hoot);
    } catch (error) {
        sendError(error, res)
    }
});

//!--- Hoots Index
router.get('/', async (req, res) => {
    try {
        const hoots = await Hoot.find({}).populate('author').sort({createdAt: 'desc'});
        return res.json(hoots);
    } catch (error) {
        sendError(error, res)
    }
});

//!---Show Hoot
router.get('/:hootId', async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId).populate('author');
        return res.json(hoot)
    } catch (error) {
        sendError(error, res)
    }
});

//!--- Update Hoot
router.put('/:hootId', async (req, res) => {
    try {
        //!--- Find the hoot
        const hoot = await Hoot.findById(req.params.hootId);

        //!--- Check permissions
        if (!hoot.author.equals(req.user._id)){
            return res.status(403).send("You can only update hoots which you authored.");
        }
        //!--- Update the hoot
        const updatedHoot = await Hoot.findByIdAndUpdate(
            req.params.hootId,
            req.body,
            {new: true }
        );

        //!---Append req.user to the author property
        updatedHoot._doc.author = req.user;

        //!---Issue JSON response
        return res.json(updatedHoot);
    } catch (error){
        sendError(error, res)
    }
})

//!---Delete Hoot
router.delete('/:hootId', async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId);

        if (!hoot.author.equals(req.user._id)) {
            return res.status(403).send("You can only update hoots which you authored.");
        }

        const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);
        res.status(200).json(deletedHoot);
    } catch (error) {
        sendError(error, res)
    }
});

//!--- Post Comment
router.post('/:hootId/comments', async (req, res) => { 
    try {
        req.body.author = req.user._id;
        const hoot = await Hoot.findById(req.params.hootId);
        hoot.comments.push(req.body);
        await hoot.save();

        //!--- Find the newly created comment
        const newComment = hoot.comments[hoot.comments.length -1];

        newComment._doc.author = req.user;

        //!--- Respond with the newComment
        return res.status(201).json(newComment);
    } catch(error) {
        sendError(error, res);
    }
});

//!--- Update Comment
router.put('/:hootId/comments/:commentId', async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId);
        const comment = hoot.comments.id(req.params.commentId);
        comment.text = req.body.text;
        await hoot.save();
        return res.status(200).json({ message: 'Ok' });
    } catch (err) {
        sendError(error, res)
    }
});

//!--- Delete Comment
router.delete('/:hootId/comments/:commentId', async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId);
        hoot.comments.remove({ _id: req.params.commentId });
        await hoot.save();
        return res.status(200).json({ message: 'Ok' });
    } catch (err) {
        sendError(error, res)
    }
});


module.exports = router;
