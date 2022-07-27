const ticketParams = new URL(document.location).searchParams;
const ticketId = ticketParams.get('id');

async function getTicketDetails() {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  const getTicketDetailsURL = `/api/1.0/ticket/${ticketId}`;
  const fetchTicketDetails = await fetch(getTicketDetailsURL, {
    headers: headers,
  });
  const ticketDetails = await fetchTicketDetails.json();

  if (ticketDetails.message == 'Not authorized to access this page') {
    const main = document.getElementsByClassName('main')[0];
    main.innerHTML = `
            <div id="error-div"><p id="error-text">Oops, nothing to see here!</p><div>
        `;
  } else {
    const ticketContainerDiv = document.getElementsByClassName('ticket-container')[0];

    let date;
    if (ticketDetails[0].ticket_start_date == ticketDetails[0].ticket_end_date) {
      date = ticketDetails[0].ticket_start_date;
    } else {
      date = `${ticketDetails[0].ticket_start_date} - ${ticketDetails[0].ticket_end_date}`;
    }

    if (ticketDetails[0].used_status == 1) {
      ticketContainerDiv.innerHTML += `
                <div>Event: ${ticketDetails[0].title}</div>
                <div>Location: ${ticketDetails[0].venue} @ ${ticketDetails[0].city}</div>
                <div>Date: ${date}</div>
                <div>Ticket Type: ${ticketDetails[0].type_name}</div>
                <div>Ticket Price: ${ticketDetails[0].price}</div>
                <img src="${ticketDetails[0].qrcode}">
                <div class="watermark">Ticket has been used</div>
            `;
    } else {
      ticketContainerDiv.innerHTML += `
                <div>Event: ${ticketDetails[0].title}</div>
                <div>Location: ${ticketDetails[0].venue} @ ${ticketDetails[0].city}</div>
                <div>Date: ${date}</div>
                <div>Ticket Type: ${ticketDetails[0].type_name}</div>
                <div>Ticket Price: ${ticketDetails[0].price}</div>
                <img src="${ticketDetails[0].qrcode}">
            `;
    }
  }
}
getTicketDetails();

function downloadPDF() {
  const pdfElement = document.getElementsByClassName('ticket-container')[0];
  html2pdf(pdfElement);
}
