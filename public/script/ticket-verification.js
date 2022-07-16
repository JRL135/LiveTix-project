
async function checkAdminRoleAndVerify() {
  const ticketURL = sessionStorage.getItem('ticketURL');
  console.log(ticketURL);

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  const URL = ticketURL;
  const verifyStatus = await fetch(URL, {
    headers: headers,
  });
  const result = await verifyStatus.json();
  console.log(result);
  let message;
  if (result.status == 1) {
    message = result.message;
  } else {
    message = result.message;
  }
  document.getElementById('verification-text').innerHTML += `${message}`;
  sessionStorage.clear();
}
checkAdminRoleAndVerify();
