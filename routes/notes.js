const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const fetchUser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

// ROUTE 1 : Get "/api/notes/fetchallnotes" all the notes

router.get('/fetchallnotes', fetchUser, async (req, res) => {
     try {
          const notes = await Note.find({ user: req.user.id })
          res.json(notes)
     } catch (error) {
          console.error(error.message);
          res.status(500).send("Cannot Get Notes! Internal server Error");
     }
})

//ROUTE 2 : POST "/api/notes/addnote" add a new note

router.post('/addnote', fetchUser, [
     body('title', 'Enter a valid title').isLength({ min: 3 }),
     body('description', 'Description must be atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {

     try {
          const { title, description, tag } = req.body;

          // IF there are errors return bad request and errors;
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
               return res.status(400).json({ errors: errors.array() });
          }

          const note = new Note({
               title, description, tag, user: req.user.id

          })
          const savedNote = await note.save();
          res.json(savedNote)
     } catch (error) {
          console.error(error.message);
          res.status(500).send("Cannot post Notes! Internal server Error");
     }

})

//ROUTE 3 : PUT "/api/notes/updatenote" Update a new note

router.put('/updatenote/:id', fetchUser, async (req, res) => {

     const { title, description, tag } = req.body;
     try {
          // Create a newNote object
          const newNote = {};
          if (title) { newNote.title = title };
          if (description) { newNote.description = description };
          if (tag) { newNote.tag = tag };

          // Find note to be updated and update it
          let note = await Note.findById(req.params.id);

          if (!note) {
               return res.status(404).send("Not Found")
          }
          if (note.user.toString() !== req.user.id) {
               return res.status(401).send("Not Allowed");
          }

          note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
          res.json({ note });
     } catch (error) {
          console.error(error.message);
          res.status(500).send("Cannot update Note! Internal server Error");
     }


})
//ROUTE 4 : DELETE "/api/notes/deletenote" Delete an existing note

router.delete('/deletenote/:id', fetchUser, async (req, res) => {
     try {
          // Find note to be delete and delete it
          let note = await Note.findById(req.params.id);
          if (!note) {
               return res.status(404).send("Not Found")
          }
          //Allow deletion only if user owns this Note
          if (note.user.toString() !== req.user.id) {
               return res.status(401).send("Not Allowed");
          }

          note = await Note.findByIdAndDelete(req.params.id);
          res.json({ "SUCCESS": "Note has been deleted", note: note });
     } catch (error) {
          console.error(error.message);
          res.status(500).send("Cannot delete Note! Internal server Error");
     }

})

router.get('/getnote/:id', fetchUser, async (req, res) => {
     try {
          // Find note to be delete and delete it
          let note = await Note.findById(req.params.id);
          if (!note) {
               return res.status(404).send("Not Found")
          }
          // note = await Note.findByIdAndDelete(req.params.id);
          note = await Note.findById(req.params.id)
          res.json({note});
     } catch (error) {
          console.error(error.message);
          res.status(500).send("Cannot Get Note! Internal server Error");
     }

})


module.exports = router;