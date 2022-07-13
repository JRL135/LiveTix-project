
// let params = new URL(document.location).searchParams;
// let search_params = params.get("keyword");
// console.log(document.location);
// let event_params = new URL(document.location);
// console.log(event_params.pathname);
// console.log("search params: " + search_params);

// async function getSearchedEvents(){
//     let eventsFetch = await fetch(`/api/1.0/events/${search_params}`);
//     let searchedEvents = await eventsFetch.json();
//     console.log(searchedEvents);
// }
// getSearchedEvents();

let searchResultsDiv = document.getElementsByClassName('search-results-events-container')[0];
console.log(searchResultsDiv);
searchResultsDiv.innerHTML = "<p id='search-results-placeholder-text'>Try searching for anything! Need some ideas? How about your favorite artist?</p>";

async function getSearchConditions(){
    const searchConditionsURL = `/api/1.0/search/events`;
    let getConditions = await fetch(searchConditionsURL)
    let searchConditions = await getConditions.json();
    console.log(searchConditions);
    let cityOptionSec = document.getElementById('city');
    for (let i = 0; i < searchConditions.length; i++) {
        cityOptionSec.innerHTML += `
            <option value="${searchConditions[i].city}">${searchConditions[i].city}</option>
        `;
    }

}
getSearchConditions();

async function postSearchConditions(e){
    let searchKeyword = document.querySelector(`#keyword`).value;
    let searchCategoryDiv = document.querySelector(`#category`);
    let searchCategory = searchCategoryDiv.options[searchCategoryDiv.selectedIndex].value;
    let searchCity = document.querySelector(`#city`).value;
    let searchDates = document.querySelector(`#date`).innerHTML;
    console.log(searchKeyword);
    console.log(searchCategory);
    console.log(searchCity);
    console.log(searchDates);

    let headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    let body = {
        keyword: searchKeyword,
        category: searchCategory,
        city: searchCity,
        dates: searchDates
    }
    const postSearchURL = `/api/1.0/search/results`;
    let post = await fetch(postSearchURL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });
    let postSearch = await post.json();
    console.log(postSearch);

    
    let searchResultsDiv = document.getElementsByClassName('search-results-events-container')[0];
    console.log(searchResultsDiv);
    searchResultsDiv.innerHTML = "";

    if (postSearch.length === 0) {
        searchResultsDiv.innerHTML += `<p id="no-result-text">Oops, there seems to be no matching events.</p>`;
    }
    searchResultsDiv = document.getElementsByClassName('search-results-events-container')[0];
    for (let i = 0; i < postSearch.length; i++) {
        // render search results on screen
        let searchResults = postSearch[i];
        let start_date = searchResults.start_date.split('T')[0];
        let end_date = searchResults.end_date.split('T')[0];
        let date;
        if (start_date === end_date) {
            date = start_date;
        } else {
            date = `${start_date} - ${end_date}`;
        }
        searchResultsDiv.innerHTML += `
            <div class="searched-event-card">
                <div class="searched-event-card-title-plus-container">
                    <div class="searched-card-item" id="searched-card-title">${searchResults.title}</div>
                    <div class="searched-card-item" id="searched-card-date">${date}</div>
                    <div class="searched-card-item">${searchResults.venue} @ ${searchResults.city}</div>
                    <a target="_parent" href="${ROOT_URL}event.html?id=${searchResults.event_id}"><button id="details-btn" class="searched-card-item">Details</button></a>
                </div>
                <img id="searched-image" src="${searchResults.main_picture}" alt="${searchResults.title}">
            </div>`;
    }
}

// predefined date range picker
$(function() {
    // pre-populate daterange
    const startNextWeek = moment().add(1, 'weeks').startOf('isoWeek');
    const endNextWeek = moment().add(1, 'weeks').endOf('isoWeek');
    let start = moment();
    var end =  moment().endOf('isoWeek');

    function cb(start, end) {
        $('#reportrange span').html(start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
    }

    $('#reportrange').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
           'Today': [moment(), moment()],
        //    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           'Tomorrow': [moment().add(1, 'day').endOf('day'), moment().add(1, 'day').endOf('day')],
           'This Week': [moment().startOf('isoWeek'), moment().endOf('isoWeek')],
           'Next Week': [startNextWeek, endNextWeek],
        //    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        //    'Next 7 Days': [moment().startOf(6, 'days'), moment().endOf(6, 'days')],
        //    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Next Month': [moment().add(1, 'month').startOf('month'), moment().add(1, 'month').endOf('month')],
        //    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);

    cb(start, end);

});