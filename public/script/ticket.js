// window.jsPDF = window.jspdf.jsPDF;
let ticket_params = new URL(document.location).searchParams;
let ticket_id = ticket_params.get("id");
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
        <img src="${ticketDetails.qrcode}">
    `;

}
getTicketDetails();

function downloadPDF(){
    let pdfElement = document.getElementsByClassName('ticket-container')[0];
    html2pdf(pdfElement);
}
// function downloadPDF(){
//     console.log("download PDF");
//     const doc = new jsPDF();
//     doc.html(document.body, {
//         cb: function(doc) {
//             doc.save('ticket.pdf');
//         }
//     });
// }