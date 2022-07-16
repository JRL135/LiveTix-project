const ROOT_URL = `${environment.backendBaseUrl}`;

async function postSignupInfo() {
  const email = document.getElementById('email').value;
  console.log(email);
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const validRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
  if (!(validRegex.test(email))) {
    alert('Please enter a valid email address1.');
  } else if (email == '') {
    alert('Please enter a valid email address.');
  } else if (username == '') {
    alert('Username cannot be empty.');
  } else if (password == '') {
    alert('Password cannot be empty.');
  } else {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    const body = {
      email: email,
      username: username,
      password: password,
    };
    const postUserURL = `${ROOT_URL}user/signup`;
    const postUser = await fetch(postUserURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const newUserStatus = await postUser.json();
    console.log(newUserStatus);
    if (newUserStatus.status === 1) {
      localStorage.setItem('token', newUserStatus.token);
      alert(newUserStatus.message);
      location.assign(`${ROOT_URL}index.html`);
    } else {
      alert(newUserStatus.message);
      location.reload();
    }
  }
}


function toLoginPage() {
  location.assign(`${ROOT_URL}login.html`);
}
