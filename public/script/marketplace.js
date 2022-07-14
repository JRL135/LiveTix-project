// marketplace
// call api for all current listings
let listings;
let user_id;
let token;

async function pageRender(){
    await checkUserId();
    await getUSerListings();
    await renderUserListingsTable();
    await getListings();
    await renderListingsTable();
}
pageRender();

async function checkUserId(){
    token = localStorage.getItem('token');
    let headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
    }
    const authRoleURL = `/user/role`;
    let authRoleStatus = await fetch(authRoleURL, {
        headers: headers
    });
    let roleStatus = await authRoleStatus.json();
    console.log(roleStatus);
    if (roleStatus == 'No token') {
        alert('Please login to access this page');
        window.location.href = "/login.html";
    } else if (roleStatus.role == 'admin') {
        alert('You are not authorized to access this page');
        window.location.href = "/index.html";
    } else {
        user_id = roleStatus.user_id;
        console.log("user_id: " + user_id);
    }
}
async function getUSerListings(){
    let headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    const userListingsURL = `/api/1.0/ticket/marketplace/listings/user/${user_id}`;
    let userListingsStatus = await fetch(userListingsURL, {
        headers: headers
    });
    userListings = await userListingsStatus.json();
    console.log(userListings);
}
async function renderUserListingsTable(){
    for (let i = 0; i < userListings.length; i++) {
        let tbody = document.getElementById("user_listings_tb_tbody");
        let tr = document.createElement('tr');
        tr.setAttribute('class', 'user-listing-tr');
        tr.setAttribute('id', `${userListings[i].listing_id}`);
        tr.setAttribute('title', `${userListings[i].my_event_title}`);
        tr.setAttribute('type', `${userListings[i].my_event_type_name}`);

        // populate table
        tr.innerHTML += `
            <td>${userListings[i].listing_id}</td>
            <td>${userListings[i].my_event_title}</td>
            <td>${userListings[i].my_event_type_name}</td>
            <td>${userListings[i].i_want_event_title}</td>
            <td>${userListings[i].i_want_ticket_type_name}</td>
        `;
        tbody.appendChild(tr);
    }

}


async function getListings(){
    let headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
    }
    const listingsURL = `/api/1.0/ticket/marketplace/listings`;
    let listingsStatus = await fetch(listingsURL, {
        headers: headers,
    });
    listings = await listingsStatus.json();
    console.log(listings);
}

let listing_selection_id;
let listing_selection_title;
let listing_selection_type;

async function renderListingsTable(){
    for (let i = 0; i < listings.length; i++) {
        let tbody = document.getElementById("listings_tb_tbody");
        let tr = document.createElement('tr');
        tr.setAttribute('class', 'listing-tr');
        tr.setAttribute('id', `${listings[i].listing_id}`);
        tr.setAttribute('title', `${listings[i].my_event_title}`);
        tr.setAttribute('type', `${listings[i].my_event_type_name}`);

        // populate table
        tr.innerHTML += `
            <td>${listings[i].listing_id}</td>
            <td>${listings[i].my_event_title}</td>
            <td>${listings[i].my_event_type_name}</td>
            <td>${listings[i].i_want_event_title}</td>
            <td>${listings[i].i_want_ticket_type_name}</td>
        `;
        tbody.appendChild(tr);
    }

    let listing_tr = document.querySelectorAll('.listing-tr');
    for (let i = 0; i < listing_tr.length; i++) {
        listing_tr[i].setAttribute('onclick', 'renderListingSelectionDiv(event)');
    }
}

function renderListingSelectionDiv(e){
    let summary_div = document.getElementsByClassName('summary-div')[0];
    summary_div.innerHTML = ``;
    console.log(e.currentTarget);
    listing_selection_id = e.currentTarget.id;
    listing_selection_title = e.currentTarget.title;
    // listing_selection_type = e.currentTarget.type;
    console.log("listing_selection_id: " + listing_selection_id);
    // console.log(listing_selection_type);
    summary_div.innerHTML += `
        <div>Listing ID: ${listing_selection_id}</div>
        <div>Listing Event: ${listing_selection_title}</div>
    `;
    let btn_div = document.getElementsByClassName('btn-div')[0];
    btn_div.innerHTML =``;
    btn_div.innerHTML += `<button id="post-btn" onclick="postListingSelection()">Submit</button>`;

}

async function postListingSelection(){
    let headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    let body = {
        user_id: user_id,
        listing_selection_id: listing_selection_id
    }
    const postListingSelectionURL = `/api/1.0/ticket/marketplace/selection`;
    let result = await fetch(postListingSelectionURL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });
    let postStatus = await result.json();
    console.log(postStatus);

    if (postStatus.status == 1){
        alert(`${postStatus.message}`);
        location.assign(`${ROOT_URL}profile.html`);
    } else {
        alert(`${postStatus.message}`);
        location.reload();
    }
}

