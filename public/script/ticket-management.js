// check admin
// if admin, show link to go to scanner page

let adminId;

async function pageRender() {
  await checkAdminRole();
  await populateTicketTable();
}
pageRender();

async function checkAdminRole() {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  const authRoleURL = `/user/role`;
  const authRoleStatus = await fetch(authRoleURL, {
    headers: headers,
  });
  const roleStatus = await authRoleStatus.json();
  if (roleStatus == 'No token') {
    alert('Please login to access this page');
    window.location.href = '/login.html';
  } else if (roleStatus.role == 'user') {
    alert('You are not authorized to access this page');
    window.location.href = '/index.html';
  } else {
    adminId = roleStatus.user_id;
  }
}


async function populateTicketTable() {
  const getVerifiedTickets = await fetch(`/api/1.0/ticket/ticket-management/verified-tickets/admin/${adminId}`);
  const verifiedTickets = await getVerifiedTickets.json();
  for (let i = 0; i < verifiedTickets.length; i++) {
    const tbody = document.getElementById('ticket_tb_tbody');
    const tr = document.createElement('tr');
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


