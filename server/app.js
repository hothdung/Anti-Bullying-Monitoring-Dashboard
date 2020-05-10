var express = require('express');
require('dotenv').config();
var cors = require('cors');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var http = require('http');
var app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


// connection to interventions_db

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
})

// connections to signals_db

var signalsConnection = mysql.createConnection({
    host: process.env.DB_SIG_HOST,
    user: process.env.DB_SIG_USER,
    password: process.env.DB_SIG_PASS,
    database: process.env.DB_SIG_DATABASE,
    port: process.env.DB_SIG_PORT
});



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

// app.post('/addSignal', function (req, res) {

//     console.log("Hello from Here" + req);
//     var signalType = req.body.body
//     var dataObj = {};
//     var q;
//     if (signalType === "heartrate") {
//         q = "INSERT INTO heartrate SET ?;";

//         dataObj = {
//             bpm: req.body.bpm,
//             date: req.body.date,
//             studentId: req.body.studentId
//         }
//         console.log(req.body.signalType);
//         console.log("Here is the data Object " + dataObj);
//     } else if (signalType === "locations") {
//         dataObj = {
//             long: req.body.long,
//             lat: req.body.lat,
//             date: req.body.date,
//             studentId: req.body.studentId
//         }
//     }
//     else if (signalType === "movements") {
//         dataObj = {
//             gravity: req.body.gravity,
//             acceleration: req.body.acceleration,
//             rotation: req.body.rotation,
//             attitude: req.body.attitude,
//             date: req.body.date,
//             studentId: req.body.studentId
//         }
//     }
//     else if (signalType === "audio") {
//         dataObj = {
//             audio: req.body.audio,
//             date: req.body.date,
//             studentId: req.body.studentId
//         }
//     }
//     else {
//         console.log("wrong signal type!")
//     }

//     signalsConnection.query(q, dataObj, function (error, result) {
//         if (error) throw error;
//         console.log(result);
//     })
//     res.status(200).end();
//     console.log("Signal successfully added to the database");
//     console.log("POST Request SENT To /addSignal");

// }
// )

app.post('/addSignal', function (req, res) {
    res.status(200).send('Hit successfully')
    console.log("received the test message");
    console.log(req.body);
})

app.listen(8080, function () {
    console.log("Server is listening on port 8080!");
});