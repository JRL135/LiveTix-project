//check admin
//if admin, show link to go to scanner page

// let ticket_params = new URL(document.location).searchParams;
// let ticket_id = ticket_params.get("id");
// console.log(ticket_id);

async function checkAdminRole(){
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
    } else if (roleStatus.role == 'user') {
        alert('You are not authorized to access this page');
        window.location.href = "/index.html";
    } else {
        alert('Welcome back to the ticket management page');
    }
}
checkAdminRole();