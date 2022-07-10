TPDirect.setupSDK(12348, 'app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF', 'sandbox')

// 必填 CCV Example
var fields = {
    number: {
        // css selector
        element: '#card-number',
        placeholder: '**** **** **** ****'
    },
    expirationDate: {
        // DOM object
        element: document.getElementById('card-expiration-date'),
        placeholder: 'MM / YY'
    },
    ccv: {
        element: '#card-ccv',
        placeholder: '後三碼'
    }
}

TPDirect.card.setup({
    fields: fields,
    styles: {
        // Style all elements
        'input': {
            'color': 'gray'
        },
        // Styling ccv field
        'input.ccv': {
            // 'font-size': '16px'
        },
        // Styling expiration-date field
        'input.expiration-date': {
            // 'font-size': '16px'
        },
        // Styling card-number field
        'input.card-number': {
            // 'font-size': '16px'
        },
        // style focus state
        ':focus': {
            // 'color': 'black'
        },
        // style valid state
        '.valid': {
            'color': 'green'
        },
        // style invalid state
        '.invalid': {
            'color': 'red'
        },
        // Media queries
        // Note that these apply to the iframe, not the root window.
        '@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
        }
    }
})

TPDirect.card.onUpdate(function (update) {
    // update.canGetPrime === true
    // --> you can call TPDirect.card.getPrime()
    if (update.canGetPrime) {
        // Enable submit Button to get prime.
        // submitButton.removeAttribute('disabled')
    } else {
        // Disable submit Button to get prime.
        // submitButton.setAttribute('disabled', true)
    }
                                            
    // cardTypes = ['mastercard', 'visa', 'jcb', 'amex', 'unknown']
    if (update.cardType === 'visa') {
        // Handle card type visa.
    }

    // number 欄位是錯誤的
    if (update.status.number === 2) {
        // setNumberFormGroupToError()
    } else if (update.status.number === 0) {
        // setNumberFormGroupToSuccess()
    } else {
        // setNumberFormGroupToNormal()
    }
    
    if (update.status.expiry === 2) {
        // setNumberFormGroupToError()
    } else if (update.status.expiry === 0) {
        // setNumberFormGroupToSuccess()
    } else {
        // setNumberFormGroupToNormal()
    }
    
    if (update.status.ccv === 2) {
        // setNumberFormGroupToError()
    } else if (update.status.ccv === 0) {
        // setNumberFormGroupToSuccess()
    } else {
        // setNumberFormGroupToNormal()
    }
})

function onSubmit(event) {
    event.preventDefault()
    
    // prevent multiple submit
    document.getElementById("paySDK-btn").onclick = '';
    // 取得 TapPay Fields 的 status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus()

    // 確認是否可以 getPrime
    if (tappayStatus.canGetPrime === false) {
        alert('Payment information incorrect, please try again.');
        return;
    }

    // Get prime
    TPDirect.card.getPrime(async (result) => {
        if (result.status !== 0) {
            window.alert('Payment unsuccessful, please try again');
            return;
        } else {
            let TP_prime = result.card.prime;
            console.log(TP_prime);
            const buyURL = `/api/1.0/event/${event_id}/tickets/buy`;
            let token = localStorage.getItem('token');
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
            console.log(buyTixResponse);

            if (buyTixResponse.success) {
                alert(`Thank you for ordering, your order number is #${buyTixResponse.success}`);
                window.location.href = "/profile.html";
            } else {
                // console.log(buyTixResponse)
                alert(`Sorry, purchase was unsuccessful, please try again!`);
                window.location.href = "/index.html";
            }
        }
        // send prime to your server, to pay with Pay by Prime API .
        // Pay By Prime Docs: https://docs.tappaysdk.com/tutorial/zh/back.html#pay-by-prime-api
    })
}

let event_params = new URL(document.location).searchParams;
let event_id = event_params.get("id");
// console.log(document.location);
// let event_params = new URL(document.location);
// console.log(event_params.pathname);
console.log(event_id);


async function getEventFavStatus(){
    console.log("getFavStatus triggered");
    let fav_icon = document.getElementById('fav-icon');
    let token = localStorage.getItem('token');
    let headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
    }
    const favURL = `/api/1.0/event/${event_id}/user/favorite`;
    let favStatusResult = await fetch(favURL, {
        headers: headers
    });
    let favStatus = await favStatusResult.json();
    console.log(favStatus);
    if (favStatus === 1) {
        console.log('favStatus: y');
        fav_icon.setAttribute('src', '../img/fav-full.png');
        fav_icon.setAttribute('status', 'full');
    } else {
        console.log('favStatus: n');
        fav_icon.setAttribute('src', '../img/fav-empty.png');
        fav_icon.setAttribute('status', 'empty');
    }
}
getEventFavStatus();

async function toggleFav(e){
    console.log("toggleFav triggered");
    let token = localStorage.getItem('token');
    let headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
    }
    let fav_icon = document.getElementById('fav-icon');
    const favURL = `/api/1.0/event/${event_id}/user/favorite`;
    let favStatusResult;
    let fav_iconStatus = fav_icon.getAttribute('status');
    if (fav_iconStatus === 'empty'){
        favStatusResult = await fetch(favURL, {
            method: 'POST',
            headers: headers
        });
        if (favStatusResult.status != 401) {
            fav_icon.setAttribute('src', '../img/fav-full.png');
            fav_icon.setAttribute('status', 'full');
            alert('Added to favorites!');
        } else {
            alert('Please log in to favorite this event!');
        }
    } else {
        favStatusResult = await fetch(favURL, {
            method: 'DELETE',
            headers: headers
        });
        fav_icon.setAttribute('src', '../img/fav-empty.png');
        fav_icon.setAttribute('status', 'empty');
        alert('Removed from favorites!');
    }
    let favStatus = await favStatusResult.json();
    console.log(favStatus);
}

//fetch event details
async function getEventDetailsAPI(){
    let eventFetch = await fetch(`/api/1.0/event/${event_id}`);
    let eventDetails = await eventFetch.json();
    document.getElementsByClassName("event_title")[0].innerHTML = eventDetails[0].title;
    console.log(document.getElementsByClassName("event_title")[0]);
    let event_start_date_unsorted = eventDetails[0].start_date;
    let event_end_date_unsorted = eventDetails[0].end_date;
    let event_start_date = event_start_date_unsorted.split('T')[0];
    let event_end_date = event_end_date_unsorted.split('T')[0];
    if (event_start_date === event_end_date) {
        document.getElementsByClassName("event_date")[0].innerHTML = `Date: ${event_start_date}`;
    } else {
        document.getElementsByClassName("event_date")[0].innerHTML = `Date: ${event_start_date} - ${event_end_date}`;
    }
    document.getElementsByClassName("event_venue")[0].innerHTML = `Location: ${eventDetails[0].venue}`;
    document.getElementsByClassName("event_location")[0].innerHTML = `City: ${eventDetails[0].city}`;
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
    let ticketsFetch = await fetch(`/api/1.0/event/${event_id}/tickets`);
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
    let ticketAvailArrayValues = Object.values(ticketAvailArray);
    console.log(ticketAvailArrayKeys);
    console.log(ticketAvailArray[ticketAvailArrayKeys[0]].type_name);

    // format ticket json data
    for (let i = 0; i < ticketAvailArrayKeys.length; i++) {
        let tbody = document.getElementById("ticket_tb_tbody");
        let tr = document.createElement('tr');
        let ticket_id_array = ticketAvailArray[ticketAvailArrayKeys[i]].ticket_id;
        // populate table
        tr.innerHTML += `
            <td>${ticketAvailArray[ticketAvailArrayKeys[i]].type_name}</td>
            <td>${ticketAvailArray[ticketAvailArrayKeys[i]].price}</td>
            <td id="available-tix">${ticket_id_array.length}</td>
            <td id="${ticketAvailArray[ticketAvailArrayKeys[i]].type_name}"></td>
        `;
        tbody.appendChild(tr);

        // populate summary section based on ticket types
        let summary_div_container = document.getElementById("ticket_selected_summary_container");
        summary_div_container.innerHTML += `<div summary-id="${ticketAvailArrayKeys[i]}" class="summary_row_tix"></div>`;
        // select tix column
        let tix_td = document.getElementById(ticketAvailArray[ticketAvailArrayKeys[i]].type_name);
        let tix_dropdown = document.createElement('select');
        tix_dropdown.setAttribute("class", "tix-dropdown");
        tix_td.appendChild(tix_dropdown);
        tix_dropdown.innerHTML += `<option value="default" selected>Choose a value</option>`;

        // populate dropdown values
        tix_dropdown.innerHTML +=`
            <option id="${ticketAvailArrayKeys[i]}" value="1 ${ticketAvailArrayKeys[i]} ${ticketAvailArrayValues[i].type_name }">1</option>
            <option id="${ticketAvailArrayKeys[i]}" value="2 ${ticketAvailArrayKeys[i]} ${ticketAvailArrayValues[i].type_name}">2</option>
            <option id="${ticketAvailArrayKeys[i]}" value="3 ${ticketAvailArrayKeys[i]} ${ticketAvailArrayValues[i].type_name}">3</option>
            <option id="${ticketAvailArrayKeys[i]}" value="4 ${ticketAvailArrayKeys[i]} ${ticketAvailArrayValues[i].type_name}">4</option>
        `;

            // tix_td.innerHTML = `<input type="number" class="tix_input" oninput="recordTicketSelection(event)" name="${ticketAvailArrayKeys[i]}" id="${ticketAvailArrayKeys[i]}_selected" min="0" max="${ticketAvailArray[ticketAvailArrayKeys[i]].ticket_id.length}">`;
    }
    // show table
    document.getElementsByClassName("main-container-s3")[0].style.display = 'flex';
    // show addToCart button
    document.getElementById("addToCart_ticket_button").style.display = 'inline-block';

    // record current user ticket selection
    let tix_dropdown = document.querySelectorAll(".tix-dropdown");
    console.log(tix_dropdown.length);
    for (let i = 0; i < tix_dropdown.length; i++) {
        tix_dropdown[i].onchange = function(){
            let ticket_selection = this.value;
            console.log(ticket_selection);
            let [ticket_number, ...rest] = ticket_selection.split(' ');
            console.log(ticket_number);
            let ticket_type_typeName = rest.join(' ');
            console.log(ticket_type_typeName);
            let [ticket_type, ...rest1] = ticket_type_typeName.split(' ');
            let ticket_type_name = rest1.join(' ');
            console.log(ticket_type);
            console.log(ticket_type_name);
            let summary_div = document.querySelector(`[summary-id="${ticket_type}"]`);
            summary_div.innerHTML = `${ticket_type_name} x ${ticket_number}`;
        
        }
    }
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
    // let ticketsFetch = await fetch(`/api/1.0/event/${event_id}/tickets`);
    // let ticketAvail = await ticketsFetch.json();
}


let postTixResponse;

async function postTicketSelection(e){
    console.log("postTicketSelection triggered");

    // get current shown input value
    let tix_selected = document.querySelectorAll(`[class="summary_row_tix"]`);
    console.log(tix_selected);
    let ticket_type_list = [];
    let ticket_number_list = [];
    for (let i = 0; i < tix_selected.length; i++) {
        let tix_selected_innerHTML = tix_selected[i].innerHTML;
        if (tix_selected_innerHTML !== "") {
            let tix_type_ = tix_selected_innerHTML.split('x')[0];
            let tix_type = tix_type_.slice(0, -1);
            let tix_number_ = tix_selected_innerHTML.split('x')[1];
            let tix_number = tix_number_.slice(1);
            ticket_type_list.push(tix_type);
            ticket_number_list.push(tix_number);
        }
    }

    let token = localStorage.getItem('token');
    let headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
    }
    const checkUserLoginURL = `/user/role`;
    let loginResult = await fetch(checkUserLoginURL, {
        headers: headers
    });
    let userLoginStatus = await loginResult.json();
    console.log(userLoginStatus);

    if (userLoginStatus == 'No token') {
        alert('Please log in to reserve tickets');
    } else {
        if (ticket_type_list.length == 0) {
            alert('Please select ticket');
        } else {
            alert('Selected ticket(s) has been reserved for 20 seconds');
            // hide add to cart button
            document.getElementById("addToCart_ticket_button").style.display = 'none';
            // unhide timer
            document.getElementById('countdown-div').style.display = 'inline';
            // show buy ticket button
            document.getElementById("buy_ticket_button").style.display = 'inline-block';

            // start timer
            startCountdown();

            let token = localStorage.getItem('token');
            const reserveURL = `/api/1.0/event/${event_id}/tickets/reserve`;
            
            let headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`,
            }

            let body = {
                event_id: event_id,
                ticket_type: ticket_type_list,
                ticket_number: ticket_number_list
            };

            console.log(headers);
            console.log("sorted body: ");
            console.log(body);

            let reserve = await fetch(reserveURL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });
            postTixResponse = await reserve.json();
            console.log("postTixResponse:");
            console.log(postTixResponse); // returns available tickets for each tix type
            if (postTixResponse === 'No token') {
                alert("Please login first.");
                window.location.href = "/login.html";
            }
        }
        
    }

}

// click pay now button
// show pay SDK
async function buyTickets(e){
    console.log("buyTickets triggered");
    //post data:
    //order: event_id, user_id
    //ticket: user_id, purchase_date
    //insert ticket_order table

    // hide pay now button
    document.getElementById("buy_ticket_button").style.display = 'none';

    //show payment section
    document.getElementsByClassName("main-container-s4")[0].style.display = 'inline-flex';

    //click pay button, after getting prime confirmation, trigger save ticket
}

// timer section
const timerElement = document.getElementById('countdown-text');
let timer;
let timeCountdown;
function startCountdown() {
    timer = 20;
    // console.log("000000")
    timeCountdown = setInterval(countdown, 1000);
    // console.log(444444)
}

function countdown() {
    // console.log("TIMER:",timer)
    if (timer == -1) {
        // console.log(11111)
        clearInterval(timeCountdown);
        // console.log(22222)
        alert('Sorry, time is up!');
        window.location.href = "/index.html";
       
    } else {
        timerElement.innerHTML = timer + ' secs';
        timer--;
    }
}



