
async function profilePageRender() {
  const username = await checkTokenAndRenderProfile();
  await getUserUnusedTickets(username);
  await getUserUsedTickets(username);
  await getUserFavEvents(username);
}
profilePageRender();

async function checkTokenAndRenderProfile() {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  const checkTokenURL = `/api/1.0/user/profile`;
  const checkToken = await fetch(checkTokenURL, {
    method: 'POST',
    headers: headers,
  });
  const userInfo = await checkToken.json();
  console.log(userInfo);
  if (userInfo === 'No token') {
    alert('Please login first');
    window.location.href = '/login.html';
  }
  const usernameDiv = document.getElementById('name-id');
  usernameDiv.innerHTML += `${userInfo.name}`;
  const useremailDiv= document.getElementById('email-id');
  useremailDiv.innerHTML += `${userInfo.email}`;
  return userInfo.name;
}

async function getUserUnusedTickets(username) {
  console.log(username);
  const getUserRegisteredEventsURL = `/api/1.0/user/${username}/tickets/unused`;
  const userRegisteredsEvents = await fetch(getUserRegisteredEventsURL);
  const registeredEvents = await userRegisteredsEvents.json();
  console.log(registeredEvents);
  const registeredEventDiv = document.getElementsByClassName('tab1-div')[0];
  for (let i = 0; i < registeredEvents.length; i++) {
    let date;
    const startDate = registeredEvents[i].start_date;
    const endDate = registeredEvents[i].end_date;
    if (startDate === endDate) {
      date = startDate;
    } else {
      date = `${startDate} - ${endDate}`;
    }
    registeredEventDiv.innerHTML += `
        <div class="registered-event-div">
            <img src="${registeredEvents[i].main_picture}">
            <div id="register-event-div-title">${registeredEvents[i].title}</div>
            <div id="register-event-div-type">${registeredEvents[i].ticket_type_name}</div>
            <div id="register-event-div-date">${date}</div>
            <div id="register-event-div-venue">${registeredEvents[i].venue} @ ${registeredEvents[i].city}</div>
            <div id="register-event-div-purchase">Purchased Date: ${registeredEvents[i].purchase_date}</div>
            <a target="_parent" href="${ROOT_URL}ticket.html?id=${registeredEvents[i].ticket_id}"><button id="ticket-btn">Ticket</button></a>
        </div>
        `;
  }
}

async function getUserUsedTickets(username) {
  console.log(username);
  const getUserRegisteredEventsURL = `/api/1.0/user/${username}/tickets/used`;
  const userRegisteredsEvents = await fetch(getUserRegisteredEventsURL);
  const registeredEvents = await userRegisteredsEvents.json();
  console.log(registeredEvents);
  const registeredEventDiv = document.getElementsByClassName('tab2-div')[0];
  for (let i = 0; i < registeredEvents.length; i++) {
    let date;
    const startDate = registeredEvents[i].start_date;
    const endDate = registeredEvents[i].end_date;
    if (startDate === endDate) {
      date = startDate;
    } else {
      date = `${startDate} - ${endDate}`;
    }
    registeredEventDiv.innerHTML += `
        <div class="registered-event-div">
            <img src="${registeredEvents[i].main_picture}">
            <div id="register-event-div-title">${registeredEvents[i].title}</div>
            <div id="register-event-div-type">${registeredEvents[i].ticket_type_name}</div>
            <div id="register-event-div-date">${date}</div>
            <div id="register-event-div-venue">${registeredEvents[i].venue} @ ${registeredEvents[i].city}</div>
            <div id="register-event-div-purchase">Purchased Date: ${registeredEvents[i].purchase_date}</div>
            <a target="_parent" href="${ROOT_URL}ticket.html?id=${registeredEvents[i].ticket_id}"><button id="ticket-btn">Ticket</button></a>
        </div>
        `;
  }
}

async function getUserFavEvents(username) {
  console.log(username);
  const getUserFavEventsURL = `/api/1.0/user/${username}/events/favorite`;
  const userFavEvents = await fetch(getUserFavEventsURL);
  const favEvents = await userFavEvents.json();
  console.log(favEvents);
  const favEventsDiv = document.getElementsByClassName('tab3-div')[0];
  console.log('length: ' + favEvents.length);
  for (let i = 0; i < favEvents.length; i++) {
    let date;
    const startDate = favEvents[i][0].start_date.split('T')[0];
    const endDate = favEvents[i][0].end_date.split('T')[0];
    if (startDate === endDate) {
      date = startDate;
    } else {
      date = `${startDate} - ${endDate}`;
    }
    favEventsDiv.innerHTML += `
        <div class="fav-event-div">
            <img src="${favEvents[i][0].main_picture}">
            <div id="fav-event-div-title">${favEvents[i][0].title}</div>
            <div id="fav-event-div-date">${date}</div>
            <div>${favEvents[i][0].venue} @ ${favEvents[i][0].city}</div>
            <a target="_parent" href="${ROOT_URL}event.html?id=${favEvents[i][0].event_id}"><button id="event-page-btn">Details</button></a>
        </div>
        `;
  }
}
