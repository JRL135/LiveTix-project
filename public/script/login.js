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
    let loginUser = await postUser.json();
    console.log(loginUser);
    if (loginUser.status === 1 ){
        localStorage.setItem("token", loginUser.token);
        alert(loginUser.message);
        location.assign(`${ROOT_URL}index.html`);
    } else {
        alert(loginUser.message);
        location.reload();
    }
}


function toSignupPage(){
    location.assign(`${ROOT_URL}signup.html`);
}