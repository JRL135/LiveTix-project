
let params = new URL(document.location).searchParams;
let categoryParams = params.get("category");
// console.log(document.location);
// let event_params = new URL(document.location);
// console.log(event_params.pathname);
console.log("category params: " + categoryParams);

async function getCurrentEvents(){
    // fetch events
    let eventsFetch = await fetch(`/api/1.0/events/${categoryParams}`);
    let currentEvents = await eventsFetch.json();
    console.log(currentEvents);

    let currentEventContainer = document.getElementsByClassName('current-events-container')[0];
    
    for (let i = 0; i < currentEvents.length; i++) {
        let start_date = currentEvents[i].start_date;
        let end_date = currentEvents[i].end_date;
        let date;
        let startDate;
        let endDate;
        if (start_date === end_date) {
            date = start_date.split('T')[0];
        } else {
            startDate = start_date.split('T')[0];
            endDate = end_date.split('T')[0];
            date = `${startDate} - ${endDate}`;
        }
        currentEventContainer.innerHTML += `
            <div class="card-container" id="container">
                <div class="card">
                    <img src="${currentEvents[i].main_picture}" alt="${currentEvents[i].title}">
                    <div class="card__details">
                        <span class="tag">${currentEvents[i].category}</span>
                        <span class="tag">${currentEvents[i].city}</span>
                        <div class="name">${currentEvents[i].title}</div>
                        <p class="date">${date}</div>
                        <a target="_parent" href="${ROOT_URL}event.html?id=${currentEvents[i].event_id}"><button>Details</button></a>
                    </div>
                </div>
            </div>`;
    }

}
getCurrentEvents();




