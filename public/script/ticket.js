let ticket_params = new URL(document.location).searchParams;
let ticket_id = ticket_params.get("id");
// console.log(document.location);
// let event_params = new URL(document.location);
// console.log(event_params.pathname);
console.log(ticket_id);

async function getTicketDetails(){
    let token = localStorage.getItem('token');
    let headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
    }
    const getTicketDetailsURL = `/api/1.0/ticket/${ticket_id}`;
    let fetchTicketDetails = await fetch(getTicketDetailsURL, {
        headers: headers,
    });
    let ticketDetails = await fetchTicketDetails.json();
    console.log(ticketDetails);
    let ticketContainerDiv = document.getElementsByClassName('ticket-container')[0];
    ticketContainerDiv.innerHTML += `
        <div>Event: ${ticketDetails.title}</div>
        <div>Location: ${ticketDetails.avenue} @ ${ticketDetails.city}</div>
        <div>Date: ${ticketDetails.date}</div>
        <div>Ticket Type: ${ticketDetails.ticket_type}</div>
        <div>Ticket Price: ${ticketDetails.ticket_price}</div>
        <button id="pdf-btn">Download Ticket PDF</button>
    `;

}
getTicketDetails();