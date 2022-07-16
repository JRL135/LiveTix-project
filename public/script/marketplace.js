// marketplace
// call api for all current listings
let listings;
let userId;
let token;

async function pageRender() {
  await checkUserId();
  await getUserListings();
  await renderUserListingsTable();
  await getListings();
  await renderListingsTable();
}
pageRender();

async function checkUserId() {
  token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  const authRoleURL = `/user/role`;
  const authRoleStatus = await fetch(authRoleURL, {
    headers: headers,
  });
  const roleStatus = await authRoleStatus.json();
  console.log(roleStatus);
  if (roleStatus == 'No token') {
    alert('Please login to access this page');
    window.location.href = '/login.html';
  } else if (roleStatus.role == 'admin') {
    alert('You are not authorized to access this page');
    window.location.href = '/index.html';
  } else {
    userId = roleStatus.user_id;
    console.log('user_id: ' + userId);
  }
}
async function getUserListings() {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  const userListingsURL = `/api/1.0/ticket/marketplace/listings/user/${userId}`;
  const userListingsStatus = await fetch(userListingsURL, {
    headers: headers,
  });
  userListings = await userListingsStatus.json();
  console.log(userListings);
}
async function renderUserListingsTable() {
  if (userListings.length === 0) {
    document.getElementById('user-table').style.display = 'none';
    const userTableContainer = document.getElementsByClassName('user-listings-table-container')[0];
    userTableContainer.innerHTML += `<div id="no-listing-text">You don't have any listings at the moment.</div>`;
  } else {
    for (let i = 0; i < userListings.length; i++) {
      const tbody = document.getElementById('user_listings_tb_tbody');
      const tr = document.createElement('tr');
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
}


async function getListings() {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  const listingsURL = `/api/1.0/ticket/marketplace/listings`;
  const listingsStatus = await fetch(listingsURL, {
    headers: headers,
  });
  listings = await listingsStatus.json();
  console.log(listings);
}

let listingSelectionId;
let listingSelectionTitle;
let listingSelectionType;

async function renderListingsTable() {
  for (let i = 0; i < listings.length; i++) {
    const tbody = document.getElementById('listings_tb_tbody');
    const tr = document.createElement('tr');
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

  const listingTr = document.querySelectorAll('.listing-tr');
  for (let i = 0; i < listingTr.length; i++) {
    listingTr[i].setAttribute('onclick', 'renderListingSelectionDiv(event)');
  }
}

function renderListingSelectionDiv(e) {
  const summaryDiv = document.getElementsByClassName('summary-div')[0];
  summaryDiv.innerHTML = ``;
  console.log(e.currentTarget);
  listingSelectionId = e.currentTarget.id;
  listingSelectionTitle = e.currentTarget.title;
  // listing_selection_type = e.currentTarget.type;
  console.log('listing_selection_id: ' + listingSelectionId);
  // console.log(listing_selection_type);
  summaryDiv.innerHTML += `
        <div>Listing ID: ${listingSelectionId}</div>
        <div>Listing Event: ${listingSelectionTitle}</div>
    `;
  const btnDiv = document.getElementsByClassName('btn-div')[0];
  btnDiv.innerHTML =``;
  btnDiv.innerHTML += `<button id="post-btn" onclick="postListingSelection()">Submit</button>`;

  const noSelectionText = document.getElementById('no-selection-text');
  // noSelectionText.style.display = 'none';
  noSelectionText.innerHTML = `The listing you wish to exchange for is:`;
}

async function postListingSelection() {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  const body = {
    user_id: userId,
    listing_selection_id: listingSelectionId,
  };
  const postListingSelectionURL = `/api/1.0/ticket/marketplace/selection`;
  const result = await fetch(postListingSelectionURL, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body),
  });
  const postStatus = await result.json();
  console.log(postStatus);

  if (postStatus.status == 1) {
    alert(`${postStatus.message}`);
    location.assign(`${ROOT_URL}profile.html`);
  } else {
    alert(`${postStatus.message}`);
    location.reload();
  }
}

