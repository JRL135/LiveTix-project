const ROOT_URL = `${environment.backendBaseUrl}`;

async function postSignupInfo(){
    console.log("posting signup info");
    let email = document.getElementById('email').value;
    console.log(email);
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    let headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    let body = {
        email: email,
        username: username,
        password: password
    }
    const postUserURL = `${ROOT_URL}user/signup`;
    let postUser = await fetch(postUserURL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });
    let newUserToken = await postUser.json();
    console.log(newUserToken);
    if (newUserToken === "Email already exists"){
        alert(newUserToken);
        location.reload();
    } else {
        localStorage.setItem("token", newUserToken);
        alert("Thank you for signing up!");
        location.assign(`${ROOT_URL}index.html`);
    }


}

function toLoginPage(){
    location.assign(`${ROOT_URL}login.html`);
}