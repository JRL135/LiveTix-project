const ROOT_URL = `${environment.backendBaseUrl}`;
const previousURL = document.referrer;
console.log(previousURL);


async function postLoginInfo(){
    let email = document.getElementById('email').value;
    console.log(email);
    let password = document.getElementById('password').value;
    // let token = localStorage.getItem('token');
    // console.log(token);

    let headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        // "Authorization": `Bearer ${token}`,
    }
    let body = {
        email: email,
        password: password
    }
    const postUserURL = `${ROOT_URL}user/login`;
    let postUser = await fetch(postUserURL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });
    let loginUserToken = await postUser.json();
    console.log(loginUserToken);
    if (loginUserToken === "Email or password does not match"){
        alert(loginUserToken);
        location.reload();
    } else {
        localStorage.setItem("token", loginUserToken);
        alert("Welcome back!");

        // if (previousURL != '') {
        //     location.assign(previousURL);
        // }
        // else {
            location.assign(`${ROOT_URL}index.html`);
        // }
    }
}


function toSignupPage(){
    location.assign(`${ROOT_URL}signup.html`);
}