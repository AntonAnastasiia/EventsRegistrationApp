const express = require('express');
const path = require('path');

const {Client} = require('pg');

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "EventsRegistrationApp",
    database: "postgres"
})

const app = express();

app.use(express.static('public'));

app.set('view engine', 'ejs');

const PORT = 3000;

var bodyParser = require('body-parser');

const date = require('date-and-time');

const createPath = (page) => path.resolve(__dirname, 'ejs-views', `${page}.ejs`);

app.listen(PORT, (error) => {
    error ? console.log(error) : console.log(`listening port ${PORT}`);
});

app.get('/', async(req, res) => {
    client.connect(function (err) {
    client.query('SELECT * FROM events ORDER BY title', function (err, data) {
        if (err) {
            console.log('Error');
        } else {
            return res.render(createPath('index'), {table: data.rows, checked1: "", checked2: "", checked3: ""});
        }
        client.end;
    }); 
    });
});
var title;
app.get('/participants_event/:id', (req, res) =>{
    client.connect(function (err) {
        client.query("SELECT title FROM events WHERE id = '"+req.params.id+"'", function (err, result) {
            if (err) {
                console.log('Error');
            }
            title = result.rows[0].title;
        }); 
        client.query("SELECT * FROM register WHERE id_event = '"+req.params.id+"'", function (err, data) {
            if (err) {
                console.log('Error');
            } else {
                return res.render(createPath('participants_event'), {table: data.rows, title: title, urlid: req.params.id, text:"" });
            }
            client.end;
        }); 
    });
});

app.get('/registration_event/:id', (req, res) => {
    client.connect(function (err) {
    client.query("SELECT title FROM events WHERE id = '"+req.params.id+"'", function (err, result) {
        if (err) {
            console.log('Error');
        }
        res.render(createPath('registration_event'), {urlid: req.params.id, title: result.rows[0].title});
        client.end;
    });
    });
});

app.use(bodyParser.urlencoded({extended:true}));     
app.post('/registration_event/:id', (req,res) => {
    client.connect(function (err) {
    client.query("INSERT INTO register(id_event, full_name, email, date_of_birth, hear_event) VALUES ('"+req.params.id+"', '"+req.body.fullname+"', '"+req.body.gmail+"', '"+req.body.date_of_birth+"', '"+req.body.hear+"')",  function(err) {
        if (err) {
          return console.log("Error");
        }
        res.render(createPath('message_registration'));
        client.end;
      });
  });
});

app.post('/', (req,res) => {
    client.connect(function (err) {
        if(req.body.sort == "event date")  {
            client.query('SELECT * FROM events ORDER BY event_data', function (err, data) {
                if (err) {
                    console.log('Error1');
                } else {
                    return res.render(createPath('index'), {table: data.rows, checked2: "checked", checked1: "", checked3: ""});
                } 
            });
        } else if(req.body.sort == "organizer"){
            client.query('SELECT * FROM events ORDER BY organizer', function (err, data) {
                if (err) {
                    console.log('Error2');
                } else {
                    return res.render(createPath('index'), {table: data.rows, checked3: "checked", checked1: "", checked2: ""});
                } 
            });
        } else {
            client.query('SELECT * FROM events ORDER BY title', function (err, data) {
                if (err) {
                    console.log('Error3');
                } else {
                    return res.render(createPath('index'), {table: data.rows, checked1: "checked", checked3: "", checked2: ""});
                } 
            });
        }
        client.end;
    });
});

app.post('/participants_event/:id', (req,res) => {
    client.connect(function (err) {
        client.query("SELECT title FROM events WHERE id = '"+req.params.id+"'", function (err, result) {
            if (err) {
                console.log('Error');
            }
            title = result.rows[0].title;
        }); 
        client.query("SELECT * FROM register WHERE id_event = '"+req.params.id+"' AND (full_name = '"+req.body.textsearch+"' OR email = '"+req.body.textsearch+"')", function (err, data) {
            if (err) {
                console.log('Error');
            } else {
                if(!data.rows.length){
                    return res.render(createPath('participants_event'), {table: data.rows, title: title, urlid: req.params.id, text:"Participant not found"});
                }
                return res.render(createPath('participants_event'), {table: data.rows, title: title, urlid: req.params.id, text:""});
            }
            client.end;
        }); 
        client.end;
    });
});

app.use((req, res) => {
    res
    .status(404)
    .render(createPath('error'));
});


