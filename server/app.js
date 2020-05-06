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



app.listen(8080, function () {
    console.log("Server is listening on port 8080!");
});