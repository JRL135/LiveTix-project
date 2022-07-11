


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
    let result = await verifyStatus.json();
    console.log(result);
    let message;
    if (result.status == 1) {
        message = result.message;
    } else {
        message = result.message;
    }
    // req.result = message;
    document.getElementById('verification-text').innerHTML += `${message}`;
    sessionStorage.clear();
}
checkAdminRoleAndVerify();