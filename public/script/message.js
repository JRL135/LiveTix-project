
let user_id;

async function pageRender(){
    await checkUserId();
    await fetchMessages();
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

//fetch messages
//render
async function fetchMessages(){
    let messagesFetch = await fetch(`/api/1.0/user/${user_id}/message`);
    let userMessages = await messagesFetch.json();
    console.log(userMessages);

    for (let i = 0; i < userMessages.length; i++) {
        let main_container = document.getElementsByClassName('main-container')[0];
        console.log(main_container);
        main_container.innerHTML += `
            <div>${userMessages[i].content}</div>
        `;
    }

}

