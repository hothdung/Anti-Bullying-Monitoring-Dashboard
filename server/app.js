var express = require('express');
require('dotenv').config();
var cors = require('cors');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


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
        q = "INSERT INTO heartrate SET ?;"
        tableSpec = "heartrate table"
    }
    else if (signalType === "locations") {
        dataObj = {
            long: req.body.long,
            lat: req.body.lat,
            date: req.body.date,
            studentId: req.body.studentId
        }
        q = "INSERT INTO locations SET ?;"
        tableSpec = "locations table"
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
        q = "INSERT INTO movements SET ?;"
        tableSpec = "movements table"
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
        q = "INSERT INTO manual SET ?;"
        tableSpec = "manual table"
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



app.listen(8080, function () {
    console.log("Server is listening on port 8080!");
});