//get user current tickets to display as option
//user select ticket & exchange condition
//user click submit to post listing info to backend

let user_id;

let selected_ticket_id;

let selected_event_id;
let event_dropdown;

let form = document.getElementsByClassName('tix-form')[0];

let ticketTypesAvail;
let selected_ticket_type;

let condition_container = document.getElementsByClassName('condition-container')[0];


async function pageRender(){
    await checkUserId();
    await getUserTickets();
    await getCurrentEvents();
    await getTicketTypes();

}
pageRender();

async function checkUserId(){
    let token = localStorage.getItem('token');
    let headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
    }
    const authRoleURL = `/user/role`;
    let authRoleStatus = await fetch(authRoleURL, {
        headers: headers
    });
    let roleStatus = await authRoleStatus.json();
    console.log(roleStatus);
    if (roleStatus == 'No token') {
        alert('Please login to access this page');
        window.location.href = "/login.html";
    } else if (roleStatus.role == 'admin') {
        alert('You are not authorized to access this page');
        window.location.href = "/index.html";
    } else {
        user_id = roleStatus.user_id;
        console.log("user_id: " + user_id);
    }
}

async function getUserTickets(){
    //fetch user current/unused tickets
    let ticketsFetch = await fetch(`/api/1.0/ticket/ticket-listing/unused-tickets/user/${user_id}`);
    let ticketsAvail = await ticketsFetch.json();
    console.log(ticketsAvail);
    let choice_1_container = document.getElementsByClassName('choice-1-container')[0];

    //USER UNUSED TICKETS dropdown create & populate
    if (ticketsAvail.length === 0){
        choice_1_container.innerHTML += `<div id="choice-container-title">Your tickets available for marketplace listing: </div>
        <div>You do not have any tickets available for marketplace listing, please come back after buying some tickets :)</div>`;
        let ticket_dropdown = document.getElementById('ticket');
        ticket_dropdown.innerHTML = ``;

    }
    else {
        //unhide condition container
        document.getElementsByClassName('condition-container')[0].style.display = 'flex';

        choice_1_container.innerHTML += `
            <div id="choice-container-title">Your tickets available for marketplace listing: </div>
            <label for="ticket">1. Select one of your tickets:</label>
            <select name="ticket" id="ticket">
            <option value="default">Select a ticket</option>
            </select>
        `;
        let ticket_dropdown = document.getElementById('ticket');
        for (let i = 0; i < ticketsAvail.length; i++) {
            ticket_dropdown.innerHTML += `
                <option value="${ticketsAvail[i].ticket_id}">Event: ${ticketsAvail[i].title}, Ticket Type: ${ticketsAvail[i].type_name}, Price: ${ticketsAvail[i].price}</option>
        `;
        }
        ticket_dropdown.setAttribute('onchange', 'recordSelectedUserTicket(event)');
    }
}

function recordSelectedUserTicket(e){
    const selectedIndex = e.target.options.selectedIndex;
    selected_ticket_id = e.target.children[selectedIndex].value;
    console.log(e.target.children[selectedIndex].value);
}

async function getCurrentEvents(){
    //generate user exchange condition: event options
    //fetch current events with ticket types
    let currentEventsFetch = await fetch(`/api/1.0/ticket/ticket-listing/exchange-conditions/events`);
    let eventsAvail = await currentEventsFetch.json();
    console.log(eventsAvail);
    console.log(eventsAvail.length);
    let choice_2_container = document.getElementsByClassName('choice-2-container')[0];
    //EVENT dropdown create & populate
    choice_2_container.innerHTML += `
        <div id="choice-container-title">Your exchange conditions: </div>
        <label for="event">2. Select an event you are interested in:</label>
        <select name="event" id="event">
            <option value="default" selected>Select an event</option>
        </select>
    `;
    event_dropdown = document.getElementById('event');
    console.log(event_dropdown);
    for (let i = 0; i < eventsAvail.length; i++) {
        event_dropdown.innerHTML += `
            <option value="${eventsAvail[i].event_id}">${eventsAvail[i].title}</option>
        `;
    }
    
    event_dropdown.setAttribute('onchange', 'recordSelectedEvent(event)');
}


async function getTicketTypes(){
    let choice_2_container = document.getElementsByClassName('choice-2-container')[0];
    choice_2_container.innerHTML += `<div id="event-btn" onclick='getSelectedEventTicketTypes()'>Generate ticket types</div>`;
    let event_btn = document.getElementById("event-btn");
    //TICKET TYPES dropdown create
    choice_2_container.innerHTML += `
        <label id="ticket-type-label" for="ticket-types">3. Select a ticket type you are interested in:</label>
        <select name="ticket-types" id="ticket-types">
            <option value="default" selected>Select an event first</option>
        </select>
    `;
    //TICKET TYPES dropdown populate in getSelectedEventTicketTypes()

}


function recordSelectedEvent(e){
    //reset summary selected event & ticket type
    let selected_event_div = document.getElementById('selected-event-condition-container');
    selected_event_div.innerHTML = ``;
    let selected_ticket_type_div = document.getElementById('selected-ticket-type-condition-container');
    selected_ticket_type_div.innerHTML = ``;
    let ticketTypes_dropdown = document.getElementById('ticket-types');
    ticketTypes_dropdown.innerHTML = `<option value="default" selected>Please press button to generate ticket types</option>`;

    const selectedIndex = e.target.options.selectedIndex;
    selected_event_id = e.target.children[selectedIndex].value;
    let selected_event_title = e.target.children[selectedIndex].text;
    console.log(e.target.children[selectedIndex].value);
    
    if (selected_event_id == 'default') {
        selected_event_div.innerHTML = ``;
    } else {
    //render in condition container
    selected_event_div.innerHTML += `
        <div id='${selected_event_id}'>${selected_event_title}</div>
    `;
    }
}

//fetch ticket types for the selected event & populate TICKET TYPES dropdown
async function getSelectedEventTicketTypes(){
    console.log("selected event id: " + selected_event_id);
    let ticketTypesFetch = await fetch(`/api/1.0/ticket/ticket-listing/event/${selected_event_id}/ticket-types`);
    ticketTypesAvail = await ticketTypesFetch.json();
    console.log(ticketTypesAvail);

    let ticketTypes_dropdown = document.getElementById('ticket-types');
    if (ticketTypesAvail.length == 0) {
        ticketTypes_dropdown.innerHTML = `<option value="default" selected>Select a valid event first</option>`;
    }
    else {
        ticketTypes_dropdown.innerHTML = `<option value="default" selected>Select a ticket type</option>`;
    }
    for (let i = 0; i < ticketTypesAvail.length; i++) {
       ticketTypes_dropdown.innerHTML += `
            <option value="${ticketTypesAvail[i].type}">${ticketTypesAvail[i].type_name}</option>
        `;
    }

    ticketTypes_dropdown.setAttribute('onchange', 'recordSelectedTicketType(event)');
}


function recordSelectedTicketType(e){
    //reset summary selected ticket type
    let selected_ticket_type_div = document.getElementById('selected-ticket-type-condition-container');
    selected_ticket_type_div.innerHTML = ``;

    const selectedIndex = e.target.options.selectedIndex;
    selected_ticket_type = e.target.children[selectedIndex].value;
    let selected_ticketType = e.target.children[selectedIndex].text;
    console.log(e.target.children[selectedIndex].value);

    //render in condition container
    selected_ticket_type_div.innerHTML += `
        <div id='${selected_ticket_type}'>${selected_ticketType}</div>
    `; 
}

async function postExchangeCondition(){
    console.log("postExchangeCondition triggered");

    if (selected_ticket_id == undefined || selected_ticket_id == 'default'){
        alert("Please select your ticket");
    } else if (selected_event_id == undefined || selected_event_id == 'default') {
        alert("Please select an event");
    } else if (selected_ticket_type == undefined || selected_ticket_type == 'default') {
        alert("Please select a ticket type");
    } else {
        let headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            // "Authorization": `Bearer ${token}`,
        }
        let body = {
            user_id: user_id,
            ticket_id: selected_ticket_id,
            selected_event_id: selected_event_id,
            selected_ticket_type: selected_ticket_type
        }
        const postExchangeURL = `/api/1.0/ticket/ticket-listing/exchange`;
        let result = await fetch(postExchangeURL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });
        let postStatus = await result.json();
        console.log(postStatus);

        if (postStatus.status === 'success'){
            alert(`Your listing has been saved! Listing number: ${postStatus.listing_id}`);
            location.assign(`${ROOT_URL}marketplace.html`);
        } else {
            alert('Something went wrong. please try again, thank you!');
            location.reload();
        }
    }
}