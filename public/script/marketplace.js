// marketplace
// call api for all current listings
let listings;

async function pageRender(){
    await getListings();
    await renderListingsTable();
}
pageRender();


async function getListings(){
    let headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    const listingsURL = `/api/1.0/ticket/marketplace/listings`;
    let listingsStatus = await fetch(listingsURL, {
        headers: headers
    });
    listings = await listingsStatus.json();
    console.log(listings);
}

async function renderListingsTable(){
    for (let i = 0; i < listings.length; i++) {
        let tbody = document.getElementById("listings_tb_tbody");
        let tr = document.createElement('tr');
        // populate table
        tr.innerHTML += `
            <td>${listings[i].my_event_title}</td>
            <td>${listings[i].my_event_type_name}</td>
            <td>${listings[i].i_want_event_title}</td>
            <td>${listings[i].i_want_ticket_type_name}</td>
        `;
        tbody.appendChild(tr);
    }
}
