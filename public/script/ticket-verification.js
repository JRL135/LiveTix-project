


async function checkAdminRoleAndVerify(){
    let ticketURL = sessionStorage.getItem("ticketURL");
    console.log(ticketURL);

    let token = localStorage.getItem('token');
    let headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
    }
    const URL = ticketURL;
    let verifyStatus = await fetch(URL, {
        headers: headers,
    });
    let status = await verifyStatus.json();
    console.log(status);
    let message;
    if (status != 'invalid ticket' && status != 'invalid ticket') {
        message = status;
    } else {
        message = "ticket verification failed";
    }
    // req.result = message;
    document.getElementById('verification-text').innerHTML += `${message}`;
    sessionStorage.clear();
}
checkAdminRoleAndVerify();