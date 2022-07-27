
let userId;

async function pageRender() {
  await checkUserId();
  await fetchMessages();
}
pageRender();

async function checkUserId() {
  const token = localStorage.getItem('token');
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
  if (roleStatus == 'No token') {
    alert('Please login to access this page');
    window.location.href = '/login.html';
  } else if (roleStatus.role == 'admin') {
    alert('You are not authorized to access this page');
    window.location.href = '/index.html';
  } else {
    userId = roleStatus.user_id;
  }
}

// fetch messages
// render
async function fetchMessages() {
  const messagesFetch = await fetch(`/api/1.0/user/${userId}/message`);
  const userMessages = await messagesFetch.json();
  if (userMessages.length === 0) {
    const mainContainer = document.getElementsByClassName('main-container')[0];
    mainContainer.innerHTML += `<div id="no-notif-text">You don't have any notifications at the moment.</div>`;
  } else {
    for (let i = 0; i < userMessages.length; i++) {
      const notificationsContainer = document.getElementsByClassName('notifications-container')[0];
      notificationsContainer.innerHTML += `
              <div class="notification-box">
                  <div id='msg-source-div'>From: ${userMessages[i].message_type}</div>
                  <div id='msg-date-div'>Date: ${userMessages[i].date}</div>
                  <div>${userMessages[i].content}</div>
              </div>
          `;
    }
  }
}

