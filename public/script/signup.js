const ROOT_URL = `${environment.backendBaseUrl}`;

async function postSignupInfo(){
    let email = document.getElementById('email').value;
    console.log(email);
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    // let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    // if (regex.test(password) === false){
    //     alert('Please enter a valid email address.');
    // } else {

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
        let newUserStatus = await postUser.json();
        console.log(newUserStatus);
        if (newUserStatus.status === 1){
            localStorage.setItem("token", newUserStatus.token);
            alert(newUserStatus.message);
            location.assign(`${ROOT_URL}index.html`);
        } else {
            alert(newUserStatus.message);
            location.reload();
        }
    // }

}


function toLoginPage(){
    location.assign(`${ROOT_URL}login.html`);
}