// get user current tickets to display as option
// user select ticket & exchange condition
// user click submit to post listing info to backend

let userId;
let selectedTicketId;
let selectedEventId;
let eventDropdown;
let ticketTypesAvail;
let selectedTicketType;

const conditionContainer = document.getElementsByClassName('condition-container')[0];

async function pageRender() {
  await checkUserId();
  await getUserTickets();
  await getCurrentEvents();
  await getTicketTypes();
}
pageRender();

async function checkUserId() {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  const authRoleURL = `/user/role`;
  const authRoleStatus = await fetch(authRoleURL, {
    headers: headers,
  });
  const roleStatus = await authRoleStatus.json();
  console.log(roleStatus);
  if (roleStatus == 'No token') {
    alert('Please login to access this page');
    window.location.href = '/login.html';
  } else if (roleStatus.role == 'admin') {
    alert('You are not authorized to access this page');
    window.location.href = '/index.html';
  } else {
    userId = roleStatus.user_id;
    console.log('user_id: ' + userId);
  }
}

async function getUserTickets() {
  // fetch user current/unused tickets
  const ticketsFetch = await fetch(`/api/1.0/ticket/ticket-listing/unused-tickets/user/${userId}`);
  const ticketsAvail = await ticketsFetch.json();
  console.log(ticketsAvail);
  const choiceOneContainer = document.getElementsByClassName('choice-1-container')[0];

  // USER UNUSED TICKETS dropdown create & populate
  if (ticketsAvail.length === 0) {
    choiceOneContainer.innerHTML += `<div id="choice-container-title">Your tickets available for marketplace listing: </div>
        <div>You do not have any tickets available for marketplace listing, please come back after buying some tickets :)</div>`;
    const ticketDropdown = document.getElementById('ticket');
    ticketDropdown.innerHTML = ``;
  } else {
    // unhide condition container
    document.getElementsByClassName('condition-container')[0].style.display = 'flex';

    choiceOneContainer.innerHTML += `
            <div id="choice-container-title">Your tickets available for marketplace listing: </div>
            <label for="ticket">1. Select one of your tickets:</label>
            <select name="ticket" id="ticket">
            <option value="default">Select a ticket</option>
            </select>
        `;
    const ticketDropdown = document.getElementById('ticket');
    for (let i = 0; i < ticketsAvail.length; i++) {
      ticketDropdown.innerHTML += `
                <option value="${ticketsAvail[i].ticket_id}">Event: ${ticketsAvail[i].title}, Ticket Type: ${ticketsAvail[i].type_name}, Price: ${ticketsAvail[i].price}</option>
        `;
    }
    ticketDropdown.setAttribute('onchange', 'recordSelectedUserTicket(event)');
  }
}

function recordSelectedUserTicket(e) {
  const selectedIndex = e.target.options.selectedIndex;
  selectedTicketId = e.target.children[selectedIndex].value;
  console.log(e.target.children[selectedIndex].value);
}

async function getCurrentEvents() {
  // generate user exchange condition: event options
  // fetch current events with ticket types
  const currentEventsFetch = await fetch(`/api/1.0/ticket/ticket-listing/exchange-conditions/events`);
  const eventsAvail = await currentEventsFetch.json();
  console.log(eventsAvail);
  console.log(eventsAvail.length);
  const choiceTwoContainer = document.getElementsByClassName('choice-2-container')[0];
  // EVENT dropdown create & populate
  choiceTwoContainer.innerHTML += `
        <div id="choice-container-title">Your exchange conditions: </div>
        <label for="event">2. Select an event you are interested in:</label>
        <select name="event" id="event">
            <option value="default" selected>Select an event</option>
        </select>
    `;
  eventDropdown = document.getElementById('event');
  console.log(eventDropdown);
  for (let i = 0; i < eventsAvail.length; i++) {
    eventDropdown.innerHTML += `
            <option value="${eventsAvail[i].event_id}">${eventsAvail[i].title}</option>
        `;
  }

  eventDropdown.setAttribute('onchange', 'recordSelectedEvent(event)');
}


async function getTicketTypes() {
  const choiceTwoContainer = document.getElementsByClassName('choice-2-container')[0];
  choiceTwoContainer.innerHTML += `<div id="event-btn" onclick='getSelectedEventTicketTypes()'>Generate ticket types</div>`;
  const eventBtn = document.getElementById('event-btn');
  // TICKET TYPES dropdown create
  choiceTwoContainer.innerHTML += `
        <label id="ticket-type-label" for="ticket-types">3. Select a ticket type you are interested in:</label>
        <select name="ticket-types" id="ticket-types">
            <option value="default" selected>Select an event first</option>
        </select>
    `;
  // TICKET TYPES dropdown populate in getSelectedEventTicketTypes()
}


function recordSelectedEvent(e) {
  // reset summary selected event & ticket type
  const selectedEventDiv = document.getElementById('selected-event-condition-container');
  selectedEventDiv.innerHTML = ``;
  const selectedTicketTypeDiv = document.getElementById('selected-ticket-type-condition-container');
  selectedTicketTypeDiv.innerHTML = ``;
  const ticketTypesDropdown = document.getElementById('ticket-types');
  ticketTypesDropdown.innerHTML = `<option value="default" selected>Please press button to generate ticket types</option>`;

  // hide submit btn
  document.getElementById('post-btn').style.display = 'none';

  const selectedIndex = e.target.options.selectedIndex;
  selectedEventId = e.target.children[selectedIndex].value;
  const selectedEventTitle = e.target.children[selectedIndex].text;
  console.log(e.target.children[selectedIndex].value);

  if (selectedEventId == 'default') {
    selectedEventDiv.innerHTML = ``;
  } else {
    // render in condition container
    selectedEventDiv.innerHTML += `
        <div id='${selectedEventId}'>Event: ${selectedEventTitle}</div>
    `;
  }
}

// fetch ticket types for the selected event & populate TICKET TYPES dropdown
async function getSelectedEventTicketTypes() {
  console.log('selected event id: ' + selectedEventId);
  const ticketTypesFetch = await fetch(`/api/1.0/ticket/ticket-listing/event/${selectedEventId}/ticket-types`);
  ticketTypesAvail = await ticketTypesFetch.json();
  console.log(ticketTypesAvail);

  const ticketTypesDropdown = document.getElementById('ticket-types');
  if (ticketTypesAvail.length == 0) {
    ticketTypesDropdown.innerHTML = `<option value="default" selected>Select a valid event first</option>`;
  } else {
    ticketTypesDropdown.innerHTML = `<option value="default" selected>Select a ticket type</option>`;
  }
  for (let i = 0; i < ticketTypesAvail.length; i++) {
    ticketTypesDropdown.innerHTML += `
            <option value="${ticketTypesAvail[i].type}">Ticket Type: ${ticketTypesAvail[i].type_name}</option>
        `;
  }

  ticketTypesDropdown.setAttribute('onchange', 'recordSelectedTicketType(event)');
}


function recordSelectedTicketType(e) {
  // reset summary selected ticket type
  const selectedTicketTypeDiv = document.getElementById('selected-ticket-type-condition-container');
  selectedTicketTypeDiv.innerHTML = ``;

  const selectedIndex = e.target.options.selectedIndex;
  selectedTicketType = e.target.children[selectedIndex].value;
  const selectedTicketTypeText = e.target.children[selectedIndex].text;
  console.log(e.target.children[selectedIndex].value);

  // render in condition container
  selectedTicketTypeDiv.innerHTML += `
        <div id='${selectedTicketType}'>${selectedTicketTypeText}</div>
    `;

  // unhide submit btn
  document.getElementById('post-btn').style.display = 'inline-block';
}

async function postExchangeCondition() {
  // disable submit btn to prevent dup submit
  document.getElementById('post-btn').disabled = true;

  console.log('postExchangeCondition triggered');

  if (selectedTicketId == undefined || selectedTicketId == 'default') {
    alert('Please select your ticket');
  } else if (selectedEventId == undefined || selectedEventId == 'default') {
    alert('Please select an event');
  } else if (selectedTicketType == undefined || selectedTicketType == 'default') {
    alert('Please select a ticket type');
  } else {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // "Authorization": `Bearer ${token}`,
    };
    const body = {
      user_id: userId,
      ticket_id: selectedTicketId,
      selected_event_id: selectedEventId,
      selected_ticket_type: selectedTicketType,
    };
    const postExchangeURL = `/api/1.0/ticket/ticket-listing/exchange`;
    const result = await fetch(postExchangeURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const postStatus = await result.json();
    console.log(postStatus);

    if (postStatus.status === 'success') {
      alert(`Your listing has been saved! Listing number: ${postStatus.listing_id}`);
      location.assign(`${ROOT_URL}marketplace.html`);
    } else {
      alert('Something went wrong. please try again, thank you!');
      location.reload();
    }
  }
}
