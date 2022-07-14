//check admin
//if admin, show link to go to scanner page

let admin_id;

async function pageRender(){
    await checkAdminRole();
    await populateTicketTable();
}
pageRender();

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
        admin_id = roleStatus.user_id;
        console.log(admin_id);
        alert('Welcome back to the ticket management page');
    }
}


async function populateTicketTable(){
    console.log("admin_id: " + admin_id);
    let getVerifiedTickets = await fetch(`/api/1.0/ticket/ticket-management/verified-tickets/admin/${admin_id}`);
    let verifiedTickets = await getVerifiedTickets.json();
    console.log(verifiedTickets);
    for (let i = 0; i < verifiedTickets.length; i++) {
        let tbody = document.getElementById("ticket_tb_tbody");
        let tr = document.createElement('tr');
        tr.innerHTML += `
            <td>${verifiedTickets[i].ticket_id}</td>
            <td>${verifiedTickets[i].user_id}</td>
            <td>${verifiedTickets[i].title}</td>
            <td>${verifiedTickets[i].event_id}</td>
            <td>${verifiedTickets[i].verified_time}</td>
            <td>${verifiedTickets[i].price}</td>
            <td>${verifiedTickets[i].type_name}</td>
            <td>${verifiedTickets[i].ticket_start_date}</td>
            <td>${verifiedTickets[i].ticket_end_date}</td>
        `;
        tbody.appendChild(tr);
    }
}



