// let params = new URL(document.location).searchParams;
// let userParams = params.get("username");
// console.log("user params: " + userParams);


async function profilePageRender(){
    let username = await checkTokenAndRenderProfile();
    await getUserUnusedTickets(username);
    await getUserUsedTickets(username);
    await getUserFavEvents(username);

}
profilePageRender();

async function checkTokenAndRenderProfile(){
    let token = localStorage.getItem('token');
    let headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
    }
    const checkTokenURL = `/api/1.0/user/profile`;
    let checkToken = await fetch(checkTokenURL, {
        method: 'POST',
        headers: headers,
    });
    let userInfo = await checkToken.json();
    console.log(userInfo);
    if (userInfo === "No token") {
        alert("Please login first");
        window.location.href = "/login.html";
    }
    let usernameDiv = document.getElementById('name-id');
    usernameDiv.innerHTML +=  `${userInfo.name}`;
    let useremailDiv= document.getElementById('email-id');
    useremailDiv.innerHTML +=  `${userInfo.email}`;
    return userInfo.name;
}


async function getUserUnusedTickets(username){
    console.log(username);
    const getUserRegisteredEventsURL = `/api/1.0/user/${username}/tickets/unused`;
    let userRegisteredsEvents = await fetch(getUserRegisteredEventsURL);
    let registeredEvents = await userRegisteredsEvents.json();
    console.log(registeredEvents);
    let registeredEventDiv = document.getElementsByClassName('tab1-div')[0];
    for (let i = 0; i < registeredEvents.length; i++) {
        let date;
        let start_date = registeredEvents[i].start_date;
        let end_date = registeredEvents[i].end_date;
        if (start_date === end_date) {
            date = start_date;
        } else {
            date = `${start_date} - ${end_date}`;
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

async function getUserUsedTickets(username){
    console.log(username);
    const getUserRegisteredEventsURL = `/api/1.0/user/${username}/tickets/used`;
    let userRegisteredsEvents = await fetch(getUserRegisteredEventsURL);
    let registeredEvents = await userRegisteredsEvents.json();
    console.log(registeredEvents);
    let registeredEventDiv = document.getElementsByClassName('tab2-div')[0];
    for (let i = 0; i < registeredEvents.length; i++) {
        let date;
        let start_date = registeredEvents[i].start_date;
        let end_date = registeredEvents[i].end_date;
        if (start_date === end_date) {
            date = start_date;
        } else {
            date = `${start_date} - ${end_date}`;
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

async function getUserFavEvents(username){
    console.log(username);
    const getUserFavEventsURL = `/api/1.0/user/${username}/events/favorite`;
    let userFavEvents = await fetch(getUserFavEventsURL);
    let favEvents = await userFavEvents.json();
    console.log(favEvents);
    let favEventsDiv = document.getElementsByClassName('tab3-div')[0];
    console.log("length: " + favEvents.length);
    for (let i = 0; i < favEvents.length; i++) {
        let date;
        let start_date = favEvents[i][0].start_date.split('T')[0];
        let end_date = favEvents[i][0].end_date.split('T')[0];
        if (start_date === end_date) {
            date = start_date;
        } else {
            date = `${start_date} - ${end_date}`;
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
