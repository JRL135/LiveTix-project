
// let params = new URL(document.location).searchParams;
// let search_params = params.get("keyword");
// console.log(document.location);
// let event_params = new URL(document.location);
// console.log(event_params.pathname);
// console.log("search params: " + search_params);
const ROOT_URL = "http://localhost:80/";


async function getSearchedEvents(){
    let eventsFetch = await fetch(`/api/1.0/events/${search_params}`);
    let searchedEvents = await eventsFetch.json();
    console.log(searchedEvents);
}
getSearchedEvents();