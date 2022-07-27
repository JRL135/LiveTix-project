
TPDirect.setupSDK(12348, 'app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF', 'sandbox');

// 必填 CCV Example
const fields = {
  number: {
    // css selector
    element: '#card-number',
    placeholder: '**** **** **** ****',
  },
  expirationDate: {
    // DOM object
    element: document.getElementById('card-expiration-date'),
    placeholder: 'MM / YY',
  },
  ccv: {
    element: '#card-ccv',
    placeholder: '後三碼',
  },
};

TPDirect.card.setup({
  fields: fields,
  styles: {
    // Style all elements
    'input': {
      'color': 'gray',
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
      'color': 'green',
    },
    // style invalid state
    '.invalid': {
      'color': 'red',
    },
    // Media queries
    // Note that these apply to the iframe, not the root window.
    '@media screen and (max-width: 400px)': {
      'input': {
        'color': 'orange',
      },
    },
  },
});

TPDirect.card.onUpdate(function(update) {
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
});

function onSubmit(event) {
  event.preventDefault();

  // prevent multiple submit
  document.getElementById('paySDK-btn').onclick = '';
  // 取得 TapPay Fields 的 status
  const tappayStatus = TPDirect.card.getTappayFieldsStatus();

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
      const TPPrime = result.card.prime;
      const buyURL = `/api/1.0/event/${eventId}/tickets/buy`;
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
      const buyTix = await fetch(buyURL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(postTixResponse),
      });
      const buyTixResponse = await buyTix.json();

      if (buyTixResponse.success) {
        alert(`Thank you for ordering, your order number is #${buyTixResponse.success}`);
        window.location.href = '/profile.html';
      } else {
        alert(`Sorry, purchase was unsuccessful, please try again!`);
        window.location.href = '/index.html';
      }
    }
    // send prime to your server, to pay with Pay by Prime API .
    // Pay By Prime Docs: https://docs.tappaysdk.com/tutorial/zh/back.html#pay-by-prime-api
  });
}

const eventParams = new URL(document.location).searchParams;
const eventId = eventParams.get('id');


async function getEventFavStatus() {
  const favIcon = document.getElementById('fav-icon');
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  const favURL = `/api/1.0/event/${eventId}/user/favorite`;
  const favStatusResult = await fetch(favURL, {
    headers: headers,
  });
  const favStatus = await favStatusResult.json();
  if (favStatus === 1) {
    favIcon.setAttribute('src', '../img/fav-full.png');
    favIcon.setAttribute('status', 'full');
  } else {
    favIcon.setAttribute('src', '../img/fav-empty.png');
    favIcon.setAttribute('status', 'empty');
  }
}
getEventFavStatus();

async function toggleFav(e) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  const favIcon = document.getElementById('fav-icon');
  const favURL = `/api/1.0/event/${eventId}/user/favorite`;
  let favStatusResult;
  const favIconStatus = favIcon.getAttribute('status');
  if (favIconStatus === 'empty') {
    favStatusResult = await fetch(favURL, {
      method: 'POST',
      headers: headers,
    });
    if (favStatusResult.status != 401) {
      favIcon.setAttribute('src', '../img/fav-full.png');
      favIcon.setAttribute('status', 'full');
      alert('Added to favorites!');
    } else {
      alert('Please log in to favorite this event!');
    }
  } else {
    favStatusResult = await fetch(favURL, {
      method: 'DELETE',
      headers: headers,
    });
    favIcon.setAttribute('src', '../img/fav-empty.png');
    favIcon.setAttribute('status', 'empty');
    alert('Removed from favorites!');
  }
  const favStatus = await favStatusResult.json();
}

// fetch event details
async function getEventDetailsAPI() {
  const eventFetch = await fetch(`/api/1.0/event/${eventId}`);
  const eventDetails = await eventFetch.json();
  document.getElementsByClassName('event_title')[0].innerHTML = eventDetails[0].title;
  let eventDescription = eventDetails[0].description;
  eventDescription = eventDescription.replaceAll('\r\n', '<br/>');
  eventDescription = eventDescription.replaceAll('\t', '&emsp;');
  const eventStartDateUnsorted = eventDetails[0].start_date;
  const eventEndDateUnsorted = eventDetails[0].end_date;
  const eventStartDate = eventStartDateUnsorted.split('T')[0];
  const eventEndDate = eventEndDateUnsorted.split('T')[0];
  if (eventStartDate === eventEndDate) {
    document.getElementsByClassName('event_date')[0].innerHTML = `Date: ${eventStartDate}`;
  } else {
    document.getElementsByClassName('event_date')[0].innerHTML = `Date: ${eventStartDate} - ${eventEndDate}`;
  }
  document.getElementsByClassName('event_venue')[0].innerHTML = `Location: ${eventDetails[0].venue}`;
  document.getElementsByClassName('event_location')[0].innerHTML = `City: ${eventDetails[0].city}`;
  document.getElementsByClassName('event_category')[0].innerHTML = `Category: ${eventDetails[0].category}`;

  const eventArtist = document.getElementsByClassName('event_artist')[0];
  for (let i = 0; i < eventDetails[0].artist.length; i++) {
    eventArtist.innerHTML += ` ${eventDetails[0].artist[i]}`;
    eventArtist.innerHTML += `,`;
  }
  function slice() {
    eventArtist.textContent = eventArtist.textContent.slice(0, -1);
  }
  slice();

  document.getElementsByClassName('event_main-image')[0].setAttribute('src', eventDetails[0].main_picture);
  document.getElementsByClassName('event_description')[0].innerHTML = eventDescription;
  document.getElementsByClassName('map-responsive')[0].innerHTML = `${eventDetails[0].map}`;
}
getEventDetailsAPI();


// fetch available tickets function
async function fetchAvailTickets() {
  const ticketsFetch = await fetch(`/api/1.0/event/${eventId}/tickets`);
  const ticketAvail = await ticketsFetch.json();

  const availableTickets = [];
  for (let i = 0; i < ticketAvail.length; i++) {
    const ticket = ticketAvail[i]; // individual ticket
    if (ticket.type in availableTickets) {
      availableTickets[ticket.type]['ticket_id'].push(ticket.ticket_id); // ticket_id = [1, 2]; ticketAvailArray = ["zone_A":{}]
    } else {
      availableTickets[ticket.type] = {type_name: ticket.type_name, price: ticket.price, ticket_id: [ticket.ticket_id]};
    }
  }
  return availableTickets;
}


// after clicking ticket button
// hide ticket button & description
async function clickTicketButton(e) {
  // hide event description section
  document.getElementsByClassName('main-container-s2')[0].style.display = 'none';
  // hide ticket button
  document.getElementById('ticket_button').style.display = 'none';

  // fetch available tickets
  const ticketAvailArray = await fetchAvailTickets();
  const ticketAvailArrayKeys = Object.keys(ticketAvailArray);
  const ticketAvailArrayValues = Object.values(ticketAvailArray);

  // format ticket json data
  for (let i = 0; i < ticketAvailArrayKeys.length; i++) {
    const tbody = document.getElementById('ticket_tb_tbody');
    const tr = document.createElement('tr');
    const ticketIdArray = ticketAvailArray[ticketAvailArrayKeys[i]].ticket_id;
    // populate table
    tr.innerHTML += `
            <td>${ticketAvailArray[ticketAvailArrayKeys[i]].type_name}</td>
            <td>${ticketAvailArray[ticketAvailArrayKeys[i]].price}</td>
            <td id="available-tix">${ticketIdArray.length}</td>
            <td id="${ticketAvailArray[ticketAvailArrayKeys[i]].type_name}"></td>
        `;
    tbody.appendChild(tr);

    // populate summary section based on ticket types
    const summaryDivContainer = document.getElementById('ticket_selected_summary_container');
    summaryDivContainer.innerHTML += `<div summary-id="${ticketAvailArrayKeys[i]}" class="summary_row_tix"></div>`;

    // select tix column
    const tixTd = document.getElementById(ticketAvailArray[ticketAvailArrayKeys[i]].type_name);
    const tixDropdown = document.createElement('select');
    tixDropdown.setAttribute('class', 'tix-dropdown');
    tixTd.appendChild(tixDropdown);
    tixDropdown.innerHTML += `<option value="default" selected>Choose a value</option>`;

    const tixAvailLength = ticketAvailArray[ticketAvailArrayKeys[i]].ticket_id.length;
    if (tixAvailLength === 0) {
      tixDropdown.innerHTML += `
        <option id="" value="">Not Available</option>
      `;
    } else if (tixAvailLength === 1) {
      tixDropdown.innerHTML +=`
      <option id="${ticketAvailArrayKeys[i]}" value="1 ${ticketAvailArrayKeys[i]} ${ticketAvailArrayValues[i].type_name }">1</option>
    `;
    } else if (tixAvailLength === 2) {
      tixDropdown.innerHTML +=`
        <option id="${ticketAvailArrayKeys[i]}" value="1 ${ticketAvailArrayKeys[i]} ${ticketAvailArrayValues[i].type_name }">1</option>
        <option id="${ticketAvailArrayKeys[i]}" value="2 ${ticketAvailArrayKeys[i]} ${ticketAvailArrayValues[i].type_name}">2</option>
      `;
    } else if (tixAvailLength === 3) {
      tixDropdown.innerHTML +=`
        <option id="${ticketAvailArrayKeys[i]}" value="1 ${ticketAvailArrayKeys[i]} ${ticketAvailArrayValues[i].type_name }">1</option>
        <option id="${ticketAvailArrayKeys[i]}" value="2 ${ticketAvailArrayKeys[i]} ${ticketAvailArrayValues[i].type_name}">2</option>
        <option id="${ticketAvailArrayKeys[i]}" value="3 ${ticketAvailArrayKeys[i]} ${ticketAvailArrayValues[i].type_name}">3</option>
      `;
    } else {
      // populate dropdown values
      tixDropdown.innerHTML +=`
              <option id="${ticketAvailArrayKeys[i]}" value="1 ${ticketAvailArrayKeys[i]} ${ticketAvailArrayValues[i].type_name }">1</option>
              <option id="${ticketAvailArrayKeys[i]}" value="2 ${ticketAvailArrayKeys[i]} ${ticketAvailArrayValues[i].type_name}">2</option>
              <option id="${ticketAvailArrayKeys[i]}" value="3 ${ticketAvailArrayKeys[i]} ${ticketAvailArrayValues[i].type_name}">3</option>
              <option id="${ticketAvailArrayKeys[i]}" value="4 ${ticketAvailArrayKeys[i]} ${ticketAvailArrayValues[i].type_name}">4</option>
          `;
    }
  }
  // show table
  document.getElementsByClassName('main-container-s3')[0].style.display = 'flex';
  // show addToCart button
  document.getElementById('addToCart_ticket_button').style.display = 'inline-block';

  // record current user ticket selection
  const tixDropdown = document.querySelectorAll('.tix-dropdown');
  for (let i = 0; i < tixDropdown.length; i++) {
    tixDropdown[i].onchange = function() {
      const ticketSelection = this.value;
      const [ticketNumber, ...rest] = ticketSelection.split(' ');
      const ticketTypeTypeName = rest.join(' ');
      const [ticketType, ...rest1] = ticketTypeTypeName.split(' ');
      const ticketTypeName = rest1.join(' ');
      const summaryDiv = document.querySelector(`[summary-id="${ticketType}"]`);
      summaryDiv.innerHTML = `${ticketTypeName} x ${ticketNumber}`;
    };
  }
}

// oninput data is recorded in event
// show selected ticket on summary table
// assign random available ticket_id to ticket_selected
// package input data with user_id & send to backend
function recordTicketSelection(e) {
  const ticketNumber = e.target.value;
  const ticketType = e.target.name;
  const summaryTicketList = [ticketNumber, ticketType];

  const summaryDiv = document.querySelector(`[summary-id="${ticketType}"]`);
  summaryDiv.innerHTML = `${summaryTicketList}`;
}

let postTixResponse;

async function postTicketSelection(e) {
  // get current shown input value
  const tixSelected = document.querySelectorAll(`[class="summary_row_tix"]`);
  const ticketTypeList = [];
  const ticketNumberList = [];
  for (let i = 0; i < tixSelected.length; i++) {
    const tixSelectedInnerHTML = tixSelected[i].innerHTML;
    if (tixSelectedInnerHTML !== '') {
      const tixType_ = tixSelectedInnerHTML.split('x')[0];
      const tixType = tixType_.slice(0, -1);
      const tixNumber_ = tixSelectedInnerHTML.split('x')[1];
      const tixNumber = tixNumber_.slice(1);
      ticketTypeList.push(tixType);
      ticketNumberList.push(tixNumber);
    }
  }

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  const checkUserLoginURL = `/user/role`;
  const loginResult = await fetch(checkUserLoginURL, {
    headers: headers,
  });
  const userLoginStatus = await loginResult.json();

  if (userLoginStatus == 'No token') {
    alert('Please log in to reserve tickets');
  } else {
    if (ticketTypeList.length == 0) {
      alert('Please select ticket');
    } else {
      // start timer
      startCountdown();

      const token = localStorage.getItem('token');
      const reserveURL = `/api/1.0/event/${eventId}/tickets/reserve`;

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const body = {
        event_id: eventId,
        ticket_type: ticketTypeList,
        ticket_number: ticketNumberList,
      };

      const reserve = await fetch(reserveURL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });
      postTixResponse = await reserve.json();
      // returns available tickets for each ticket type
      if (postTixResponse === 'No token') {
        alert('Please login first.');
        window.location.href = '/login.html';
      } else if (postTixResponse.status === '0') {
        alert(postTixResponse.message); // Sorry, there are no available tickets at the moment.
      } else {
        alert(`Selected ticket(s) has been reserved for 5 minutes`);
        // hide add to cart button
        document.getElementById('addToCart_ticket_button').style.display = 'none';
        // unhide timer
        document.getElementById('countdown-div').style.display = 'inline';
        // show buy ticket button
        document.getElementById('buy_ticket_button').style.display = 'inline-block';
        // replace selection summary with reserved tickets
        document.getElementById('ticket_selected_summary_container').innerHTML = `
            <div class="ticket_selected_summary_container_item" id="order_summary_title">Reserved Tickets Summary</div>`;
        for (let i = 0; i < postTixResponse.result.length; i++) {
          document.getElementById('ticket_selected_summary_container').innerHTML += `
            <div summary-id='${postTixResponse.result[i].type}' class='summary_row_tix'>${postTixResponse.result[i].type_name} x ${postTixResponse.result[i].number}</div>
          `;
        }
      }
    }
  }
}

// click pay now button
// show pay SDK
async function buyTickets(e) {
  // post data:
  // order: event_id, user_id
  // ticket: user_id, purchase_date

  // hide pay now button
  document.getElementById('buy_ticket_button').style.display = 'none';

  // show payment section
  document.getElementsByClassName('main-container-s4')[0].style.display = 'inline-flex';

  // click pay button, after getting prime confirmation, trigger save ticket
}

// timer section
const timerElement = document.getElementById('countdown-text');
let timer;
let timeCountdown;
function startCountdown() {
  timer = 300;
  timeCountdown = setInterval(countdown, 1000);
}

function countdown() {
  if (timer == 0) {
    timer = 0;
    clearInterval(timeCountdown);
    alert('Sorry, time is up!');
    window.location.href = '/index.html';
  } else {
    timer = parseInt(timer) - 1;
  }
  let minutes = Math.floor(timer / 60);
  let seconds = timer % 60;
  if (minutes<10) minutes = '0'+minutes;
  if (seconds<10) seconds = '0'+seconds;
  timerElement.innerHTML = `${minutes} : ${seconds}`;
}

