
const params = new URL(document.location).searchParams;
const categoryParams = params.get('category');
// console.log(document.location);
// let event_params = new URL(document.location);
// console.log(event_params.pathname);
console.log('category params: ' + categoryParams);


async function getCurrentEvents() {
  // fetch events
  const eventsFetch = await fetch(`/api/1.0/events/${categoryParams}`);
  const currentEvents = await eventsFetch.json();
  console.log(currentEvents);

  const currentEventText = document.getElementById('current-event-text');
  if (categoryParams == 'concert') {
    currentEventText.innerHTML = `Current Concerts`;
  } else if (categoryParams == 'festival') {
    currentEventText.innerHTML = `Current Festivals`;
  }

  const currentEventContainer = document.getElementsByClassName('current-events-container')[0];

  for (let i = 0; i < currentEvents.length; i++) {
    let startDate = currentEvents[i].start_date;
    let endDate = currentEvents[i].end_date;
    let date;
    // let startDate;
    // let endDate;
    if (startDate === endDate) {
      date = startDate.split('T')[0];
    } else {
      startDate = startDate.split('T')[0];
      endDate = endDate.split('T')[0];
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

