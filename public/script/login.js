/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
const ROOT_URL = `${environment.backendBaseUrl}`;
const previousURL = document.referrer;
console.log(previousURL);


async function postLoginInfo() {
  const email = document.getElementById('email').value;
  console.log(email);
  const password = document.getElementById('password').value;
  // let token = localStorage.getItem('token');
  // console.log(token);

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // "Authorization": `Bearer ${token}`,
  };
  const body = {
    email: email,
    password: password,
  };
  const postUserURL = `${ROOT_URL}user/login`;
  const postUser = await fetch(postUserURL, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body),
  });
  const loginUser = await postUser.json();
  console.log(loginUser);
  if (loginUser.status === 1 ) {
    localStorage.setItem('token', loginUser.token);
    alert(loginUser.message);
    location.assign(`${ROOT_URL}index.html`);
  } else {
    alert(loginUser.message);
    location.reload();
  }
}


function toSignupPage() {
  location.assign(`${ROOT_URL}signup.html`);
}
