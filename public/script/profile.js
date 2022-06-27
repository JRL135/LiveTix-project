// let params = new URL(document.location).searchParams;
// let userParams = params.get("username");
// console.log("user params: " + userParams);

async function profilePageRender(){
    let username = await checkTokenAndRenderProfile();
    await getUserRegisteredEvents(username);

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
        // body: JSON.stringify(body)
    });
    let userInfo = await checkToken.json();
    console.log(userInfo);
    let usernameDiv = document.getElementById('name-id');
    usernameDiv.innerHTML +=  `${userInfo.name}`;
    let useremailDiv= document.getElementById('email-id');
    useremailDiv.innerHTML +=  `${userInfo.email}`;
    return userInfo.name;
}


async function getUserRegisteredEvents(username){
    console.log(username);
    const getUserRegisteredEventURL = `/api/1.0/user/${username}/events/registered`;
    let userRegisteredEvents = await fetch(getUserRegisteredEventURL);
    let registeredEvents = await userRegisteredEvents.json();
    console.log(registeredEvents);
    let registeredEventDiv = document.getElementsByClassName('tab1-div')[0];
    for (let i = 0; i < registeredEvents.length; i++) {
        let start_date = registeredEvents[i].start_date.split('T')[0];
        registeredEventDiv.innerHTML += `
        <div class="registered-event-div">
            <img src="${registeredEvents[i].main_picture}">
            <div>${registeredEvents[i].title}</div>
            <div>${start_date}</div>
            <div>${registeredEvents[i].avenue} @ ${registeredEvents[i].city}</div>
            <button id="ticket-btn">Ticket</button>
        </div>
        `;
    }

}
