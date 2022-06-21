let event_params = new URL(document.location).searchParams;
let product_id = event_params.get("id");
// console.log(document.location);
// let event_params = new URL(document.location);
// console.log(event_params.pathname);
console.log(product_id);

//fetch event details
async function getEventDetailsAPI(){
    let eventFetch = await fetch(`/api/1.0/event/${product_id}`);
    let eventDetails = await eventFetch.json();
    document.getElementsByClassName("event_title")[0].innerHTML = eventDetails[0].title;
    console.log(document.getElementsByClassName("event_title")[0]);
    let event_date_unsorted = eventDetails[0].date;
    let event_date = event_date_unsorted.split('T')[0];
    document.getElementsByClassName("event_date")[0].innerHTML = `Date: ${event_date}`;
    document.getElementsByClassName("event_location")[0].innerHTML = `Location: ${eventDetails[0].location}`;
    document.getElementsByClassName("event_category")[0].innerHTML = `Category: ${eventDetails[0].category}`;
    document.getElementsByClassName("event_artist")[0].innerHTML = `
    Artist: ${eventDetails[0].artist}`;
    document.getElementsByClassName("event_main-image")[0].setAttribute('src', eventDetails[0].main_picture);
    // document.getElementsByClassName("event_main-image")[0].innerHTML = "main_image";
    document.getElementsByClassName("event_description")[0].innerHTML = eventDetails[0].description;
}
getEventDetailsAPI();


//fetch available tickets function
async function fetchAvailTickets(){
    let ticketsFetch = await fetch(`/api/1.0/event/${product_id}/tickets`);
    let ticketAvail = await ticketsFetch.json();

    let availableTickets = [];
    for (let i = 0; i < ticketAvail.length; i++) {
        const ticket = ticketAvail[i]; // individual ticket
        if (ticket.type in availableTickets) {
            availableTickets[ticket.type]["ticket_id"].push(ticket.ticket_id); //ticket_id = [1, 2]; ticketAvailArray = ["zone_A":{}]
        } else {
            availableTickets[ticket.type] = {type_name: ticket.type_name, price: ticket.price, ticket_id: [ticket.ticket_id]}
        }
    }
    // console.log(availableTickets);
    return availableTickets;
}


//after clicking ticket button
//hide ticket button & description
async function clickTicketButton(e){
    // hide event description section
    document.getElementsByClassName("main-container-s2")[0].style.display = 'none';
    // hide ticket button
    document.getElementById("ticket_button").style.display = 'none';

    // fetch available tickets
    let ticketAvailArray = await fetchAvailTickets();

    console.log(ticketAvailArray);
    console.log(ticketAvailArray["zone_A"]);
    let ticketAvailArrayKeys = Object.keys(ticketAvailArray);
    console.log(ticketAvailArrayKeys);
    console.log(ticketAvailArray[ticketAvailArrayKeys[0]].type_name);

    // format ticket json data
    for (let i = 0; i < ticketAvailArrayKeys.length; i++) {
        let tbody = document.getElementById("ticket_tb_tbody");
        let tr = document.createElement('tr');
        // populate table
        tr.innerHTML += `<td>${ticketAvailArray[ticketAvailArrayKeys[i]].type_name}</td><td>${ticketAvailArray[ticketAvailArrayKeys[i]].price}</td><td id="${ticketAvailArray[ticketAvailArrayKeys[i]].type_name}"></td>`;
        tbody.appendChild(tr);
        // populate summary section based on ticket types
        let summary_div_container = document.getElementById("ticket_selected_summary_container");
        summary_div_container.innerHTML += `<div summary-id="${ticketAvailArrayKeys[i]}" class="summary_row_tix"></div>`;
        // select tix column
        let tix_td = document.getElementById(ticketAvailArray[ticketAvailArrayKeys[i]].type_name);
        for (let j = 0; j < ticketAvailArray[ticketAvailArrayKeys[i]].ticket_id.length; j++) {
            tix_td.innerHTML = `<input type="number" class="tix_input" oninput="recordTicketSelection(event)" name="${ticketAvailArrayKeys[i]}" id="${ticketAvailArrayKeys[i]}_selected" min="0" max="${ticketAvailArray[ticketAvailArrayKeys[i]].ticket_id.length}">`;
        }
    }
    // show table
    document.getElementsByClassName("main-container-s3 w3-cell-row")[0].style.display = 'inline-block';
    // show summary table
    // document.getElementById("ticket_selected_summary_container").style.display = 'inline-block';
    // show addToCart button
    document.getElementById("addToCart_ticket_button").style.display = 'inline-block';
}

// oninput data is recorded in event
// show selected ticket on summary table
// assign random available ticket_id to ticket_selected
// package input data with user_id & send to backend
function recordTicketSelection(e){
    console.log(e.target.value); //ticket number
    console.log(e.target.name); //ticket type
    let ticket_number = e.target.value;
    let ticket_type = e.target.name;
    // let ticketObj = {ticket_type, ticket_number};
    let summaryTicketList = [ticket_number, ticket_type];
    // summaryTicketList.push(ticketObj);
    console.log(summaryTicketList);



    let summary_div = document.querySelector(`[summary-id="${ticket_type}"]`);
    summary_div.innerHTML = `${summaryTicketList}`;
    // map selected tickets with available ticket_id
    // let ticketsFetch = await fetch(`/api/1.0/event/${product_id}/tickets`);
    // let ticketAvail = await ticketsFetch.json();
}

let postTixResponse;

async function postTicketSelection(e){
    console.log("postTicketSelection triggered");

    // hide add to cart button
    document.getElementById("addToCart_ticket_button").style.display = 'none';

    // get current shown input value
    let tix_selected = document.querySelectorAll(`[class="summary_row_tix"]`);
    console.log(tix_selected);
    let ticket_type_list = [];
    let ticket_number_list = [];
    for (let i = 0; i < tix_selected.length; i++) {
        let tix_selected_innerHTML = tix_selected[i].innerHTML;
        tix_number = tix_selected_innerHTML.split(',')[0];
        tix_type = tix_selected_innerHTML.split(',')[1];
        ticket_type_list.push(tix_type);
        ticket_number_list.push(tix_number);
    }

    const token = 12345;
    const reserveURL = `/api/1.0/event/${product_id}/tickets/reserve`;
    
    let headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
    }

    let body = {
        ticket_type: ticket_type_list,
        ticket_number: ticket_number_list
    };

    console.log(headers);
    console.log(body);

    let reserve = await fetch(reserveURL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });
    postTixResponse = await reserve.json();
    console.log("postTixResponse:");
    console.log(postTixResponse); // returns available tickets for each tix type

    // show buy ticket button
    document.getElementById("buy_ticket_button").style.display = 'inline-block';
    

}

// click pay now button
// LATER: check timer_timestamp < 10m, then
// post postTixResponse to backend
async function buyTickets(e){
    console.log("buyTickets triggered");
    //post data:
    //order: event_id, user_id
    //ticket: user_id, purchase_date
    //insert ticket_order table
    const buyURL = `/api/1.0/event/${product_id}/tickets/buy`;
    const token = 12345;
    let headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
    }
    let buyTix = await fetch(buyURL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(postTixResponse)
    });
    let buyTixResponse = await buyTix.json();
    console.log("thanks for ordering, your order number is: ");
    console.log(buyTixResponse);

    alert(`Thank you for ordering, your order number is #${buyTixResponse}`);

}






// // track selected number of tix
// function addToCartShowSummary(e){
//     // selectElement = document.querySelector(`#${ticketAvailArrayKeys[i]}`);
//     ticket_selected_value = e.target.value;
//     console.log(e);
//     console.log(ticket_selected_value);
//     document.getElementById(`summary_div_${ticketAvailArrayKeys[i]}`).innerHTML = `${ticket_selected_value}`;
//     // document.querySelector('.output').innerHTML = ticket_selected_value;
// }