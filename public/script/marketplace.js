// marketplace
// call api for all current listings
let listings;
let user_id;

async function pageRender(){
    await checkUserId();
    await getListings();
    await renderListingsTable();
}
pageRender();

async function checkUserId(){
    let token = localStorage.getItem('token');
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

    let main_container = document.getElementsByClassName('main-container')[0];
    main_container.innerHTML += `
        <div class="listing-selection-container">
            <div>Selected listing<div>
        </div>
    `;

    let listing_tr = document.querySelectorAll('.listing-tr');
    for (let i = 0; i < listing_tr.length; i++) {
        listing_tr[i].setAttribute('onclick', 'renderListingSelectionDiv(event)');
    }
}

function renderListingSelectionDiv(e){
    let listing_selection_container = document.getElementsByClassName('listing-selection-container')[0];
    listing_selection_container.innerHTML = `<div>Selected listing<div>`;
    console.log(e.currentTarget);
    listing_selection_id = e.currentTarget.id;
    listing_selection_title = e.currentTarget.title;
    // listing_selection_type = e.currentTarget.type;
    console.log("listing_selection_id: " + listing_selection_id);
    // console.log(listing_selection_type);
    listing_selection_container.innerHTML += `
        <div>Listing Id: ${listing_selection_id}<div>
        <div>Listing Event: ${listing_selection_title}<div>
        <button id="post-btn" onclick="postListingSelection()">Submit</button>
    `;

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