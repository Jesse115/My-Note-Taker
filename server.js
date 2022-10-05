const express = require('express');
const path = require("path");
const fs = require("fs");
const util = require("util")
const { v4: uuidv4 } = require("uuid")

// Initialize the app and create a port
const app = express();
const PORT = process.env.PORT || 3001;

// util function 
const readUtility = util.promisify(fs.readFile)
const writeUtility = util.promisify(fs.writeFile)

// Set up body parsing, static, and route middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get("/api/notes", (req, res) => {
    readUtility("./db/db.json").then((data) => res.json(JSON.parse(data)))
});

// section writes the new note to the json file and sens back to browser
app.post("/api/notes", (req, res) => {
    const { title, text } = req.body

    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuidv4(),
        }

        readUtility("./db/db.json")
            .then((data) => {
                const oldNotes = JSON.parse(data);
                oldNotes.push(newNote);
                writeUtility("./db/db.json", JSON.stringify(oldNotes))
            })

        const response = {
            status: "success",
            body: newNote,
        }

        res.status(201).json(response)
    } else {
        res.status(500).json("couldn't save note")
    }


});

app.get("/notes", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/notes.html"));
});

// If no matching route is found, then default to home
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/index.html"));
});

// Start the server on the port
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));