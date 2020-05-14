var express = require('express');
require('dotenv').config();
var cors = require('cors');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var http = require('http');
var app = express();
var multer = require('multer');
const path = require('path');
//var upload = multer({ dest: 'uploads/', limits: { fieldSize: 10000000000 } }).any()

// building storage engine  cb --> callback


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.raw({ type: 'audio/m4a', limit: '60mb' }))
app.use(cors());

app.use(express.static('./public'));

const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 100000000 }
}).single('audioName');

// checking the extension and mimeType
function checkFileType(file, cb) {

    const fileTypes = /mp4|m4a/;
    // checking extension
    const extensionName = fileTypes.test(path.extname((file.originalname).toLowerCase()));

    // checking mimeType
    const mimeType = fileTypes.test(file.mimeType);

    if (mimeType && extensionName) {
        return cb(null, true);
    } else {
        cb('Just audio files allowed!!')
    }
}

// connection to interventions_db

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
})


var signalsConnection = mysql.createConnection({
    host: process.env.DB_SIG_HOST,
    user: process.env.DB_SIG_USER,
    password: process.env.DB_SIG_PASS,
    database: process.env.DB_SIG_DATABASE,
    port: process.env.DB_SIG_PORT
})

var outputConnection = mysql.createConnection({
    host: process.env.DB_OUT_HOST,
    user: process.env.DB_OUT_USER,
    password: process.env.DB_OUT_PASS,
    database: process.env.DB_OUT_DATABASE,
    port: process.env.DB_OUT_PORT
})

app.post('/interventions', function (req, res) {
    const intervention = {
        interventionType: req.body.interventionType,
        place: req.body.place,
        students: req.body.students,
        date: req.body.date,
        time: req.body.time,
        severity: req.body.severity,
        teachers: req.body.teachers
    }

    var q = "INSERT INTO interventions SET ?;";

    connection.query(q, intervention, function (error, result) {
        if (error) throw error;
        console.log(result);
        res.send("Posted to DB");
    })
    console.log("Entry successfully added to the database");
    console.log("POST Request SENT To /INTERVENTIONS");
})

app.get('/posts', function (req, res) {

    var q = "SELECT * FROM interventions;";

    connection.query(q, function (error, result) {
        if (error) throw error;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
    });
})


app.post('/addAudio', (req, res) => {
    upload(req, res, (err) => {

        if (err) {
            console.log("There is an error " + err)
        } else {
            console.log(req.file);
            console.log("Obtained audio file!")
        }
    })
    console.log("Audio is successfully posted!")
    console.log("Obtained audio data: ", req.file);

})

app.post('/addSignal', function (req, res) {
    var signalType = req.body.signalType;
    var dataObj = {};
    var q;
    var tableSpec;
    if (signalType === "heartrate") {
        dataObj = {
            bpm: req.body.bpm,
            date: req.body.date,
            studentId: req.body.studentId
        }
        q = "INSERT INTO heartrate SET ?;";
        tableSpec = "heartrate table";
    }
    else if (signalType === "locations") {
        dataObj = {
            long: req.body.long,
            lat: req.body.lat,
            date: req.body.date,
            studentId: req.body.studentId
        }
        q = "INSERT INTO locations SET ?;";
        tableSpec = "locations table";
    }

    else if (signalType === "movements") {
        dataObj = {
            gravity: req.body.gravity,
            acceleration: req.body.acceleration,
            rotation: req.body.rotation,
            attitude: req.body.attitude,
            fallenDown: req.body.fallenDown,
            date: req.body.date,
            studentId: req.body.studentId
        }
        q = "INSERT INTO movements SET ?;";
        tableSpec = "movements table";
    }
    else if (signalType === "manual") {
        dataObj = {
            long: req.body.long,
            lat: req.body.lat,
            bpm: req.body.bpm,
            gravity: req.body.gravity,
            acceleration: req.body.acceleration,
            rotation: req.body.rotation,
            attitude: req.body.attitude,
            fallenDown: req.body.fallenDown,
            message: req.body.message,
            date: req.body.date,
            studentId: req.body.studentId
        }
        q = "INSERT INTO manual SET ?;";
        tableSpec = "manual table";

        query = "INSERT INTO test_table SET ?;";
        var outputObj = {};
        outputObj = {
            long: req.body.long,
            lat: req.body.lat,
            bpm: req.body.bpm,
            message: req.body.message
        }

        outputConnection.query(query, outputObj, function (error, result) {
            if (error) throw error;
            console.log(result);
            console.log("Posted to test_table");
        })

    }
    else {
        return new Error('Wrong signal type!')
    }
    signalsConnection.query(q, dataObj, function (error, result) {
        if (error) throw error;
        console.log(result);
        res.send("Posted to DB");
        console.log("Posted to " + tableSpec);
    })
})



app.get('/outputManual', function (req, res) {
    var q = "SELECT * FROM test_table;";

    outputConnection.query(q, function (error, result) {
        if (error) throw error;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
    });
})


app.post('/addSignal', function (req, res) {
    console.log(req.body)
    res.send("Request received")
})

app.listen(8080, function () {
    console.log("Server is listening on port 8080!");
});