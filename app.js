require("dotenv").config();
const express = require("express");
// const mysql = require("mysql2");
// const multer = require("multer");
const path = require("path");
const { printReq, getEventDetailsAPI, getAvailableTickets, reserveTickets, saveTicketOrder, getCurrentEvents, getSearchOptions, getSearchedEvents } = require("./controllers/event-controller");
const {registerUser, loginUser, getUserProfile, getUserRegisteredEvents, checkUserRole, checkUserMiddleware, checkIndividualUser} = require("./controllers/user-controller");
const {getTicketDetails, authTicket} = require("./controllers/ticket-controller");


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));

app.get('/', (req, res)=>{
    res.send("homepage");
})



// API routes (frontend call backend)

app.get(`/api/${process.env.api}/event/:id`, getEventDetailsAPI, (req, res)=>{
    console.log("Entered event details page");
    res.json(req.result);
})

app.get(`/api/${process.env.api}/event/:id/tickets`, getAvailableTickets, (req, res)=>{
    res.json(req.result);
})

app.post(`/api/${process.env.api}/event/:id/tickets/reserve`, checkUserMiddleware, reserveTickets, (req, res)=>{
    res.json(req.result);
})

app.post(`/api/${process.env.api}/event/:id/tickets/buy`, saveTicketOrder, (req, res)=>{
    res.json({
        success: req.order_result,
        failure: req.anti_order_result
    });
});

app.get(`/api/${process.env.api}/events/:category`, getCurrentEvents, (req, res)=>{
    res.json(req.result);
})

app.get(`/api/${process.env.api}/events/:keyword`, getSearchedEvents, (req, res)=>{
    console.log("getSearchedEventsAPI triggered");
    res.json(req.result);
})

app.get(`/api/${process.env.api}/search/events`, getSearchOptions, (req, res)=>{
    res.json(req.result);
})


app.post(`/api/${process.env.api}/search/results`, getSearchedEvents, (req, res)=>{
    res.json(req.result);
})

app.post(`/user/signup`, registerUser, (req, res)=>{
    res.json(req.result);
});

app.post(`/user/login`, loginUser, (req, res)=>{
    res.json(req.result);
});

app.post(`/api/${process.env.api}/user/profile`, getUserProfile, (req, res)=>{
    console.log("user profile API triggered");
    res.json(req.result);
})

app.get(`/api/${process.env.api}/user/:username/events/registered`, getUserRegisteredEvents, (req, res)=>{
    res.json(req.result);
})

app.get(`/api/${process.env.api}/ticket/:id`, checkUserMiddleware, checkIndividualUser, getTicketDetails, (req, res)=>{
    res.json(req.result);
})

// app.get(`/api/${process.env.api}/ticket/:id/qrcode/`, checkAdmin, authTicket, (req, res)=>{
//     res.json(req.result);
// })

// app.get(`/api/${process.env.api}/ticket/verification`, authTicket, (req, res)=>{
//     res.json(req.result);
// })

app.get(`/ticket/verification/:hash`, authTicket, (req, res)=>{
    res.json(req.result);
})

//generic checkUserRole api
app.get(`/user/role`, checkUserMiddleware, (req, res)=>{
    res.json(req.result);
})







// frontend routes
// event.html

// app.get(`/events/:id`, getEventDetailsAPI, (req, res)=>{
//     res.json(req.result);
// })
















// not used
// app.get('/ticket/details', getTicketDetailsAPI, (req, res)=>{
//     res.json(req.result);
// })


// app.post('/ticket/type', saveTicketSelection, (req, res)=>{
//     res.send('ticket selection sent');
// })

// app.post('/ticket/attendee', saveAttendeeInfo, (req, res)=>{
//     res.send('attendee info sent')
// })

// app.get(`/event/:id/reserve`, (req, res)=>{
//     res.sendFile(path.join(__dirname, '/reserve.html'));
// })

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));