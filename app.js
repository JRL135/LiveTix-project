require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const { getEventDetailsAPI, getAvailableTickets, saveTicketOrder} = require("./controllers/event-controller");
const { getTicketDetailsAPI, saveTicketSelection, saveAttendeeInfo } = require("./controllers/ticket-controller");


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res)=>{
    res.send("homepage");
})


//API routes (frontend call backend)

app.get(`/api/${process.env.api}/event/:id`, getEventDetailsAPI, (req, res)=>{
    res.json(req.result);
})

app.get(`/api/${process.env.api}/event/:id/tickets`, getAvailableTickets, (req, res)=>{
    res.json(req.result);
})

app.post(`/api/${process.env.api}/event/:id/tickets/reserve`, (req, res)=>{
    // res.json(req.result);
})

app.post(`/api/${process.env.api}/event/:id/buy`, saveTicketOrder, (req, res)=>{
});

// app.get(`/api/${process.env.api}/events/:category`,(req, res)=>{
//     res.json();
// })







//client routes (client call frontend)
//event.html
//reserve.html
app.use(express.static("./public"));

app.get(`/event/:id/reserve`, (req, res)=>{
    res.sendFile(path.join(__dirname, '/reserve.html'));
})




// app.get(`/events/:id`, getEventDetailsAPI, (req, res)=>{
//     res.json(req.result);
// })
















// not used
app.get('/ticket/details', getTicketDetailsAPI, (req, res)=>{
    res.json(req.result);
})


app.post('/ticket/type', saveTicketSelection, (req, res)=>{
    res.send('ticket selection sent');
})

app.post('/ticket/attendee', saveAttendeeInfo, (req, res)=>{
    res.send('attendee info sent')
})



const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));