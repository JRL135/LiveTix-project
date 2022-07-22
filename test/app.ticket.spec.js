const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const app = require('../app');
const requester = chai.request(app).keepOpen();
const assert = chai.assert;
const expect = chai.expect;
const {users, reserveTickets} = require('./fake-data');

require('dotenv').config({path: '../.env'});

describe('ticket / getTicketDetails', async () => {
  const id = 3; // ticket_id
  const user1 = users[2];
  const user = {
    email: user1.email,
    password: user1.password,
  };
  let token;
  before(async () => {
    const res = await requester
        .post('/user/login')
        .send(user);
    const data = res.body;
    console.log(data);
    token = data.token;
  });

  it('GET / getTicketDetails', async () => {
    const res = await requester
        .get(`/api/${process.env.api}/ticket/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({});
    console.log(res.body);
    expect(res.statusCode).to.equal(200);
    expect(res.body[0].ticket_id).to.equal(3);
  });
});

describe('ticket / getTicketDetails', async () => {
  const id = 3; // ticket_id
  const user1 = users[0];
  const user = {
    email: user1.email,
    password: user1.password,
  };
  let token;
  before(async () => {
    const res = await requester
        .post('/user/login')
        .send(user);
    const data = res.body;
    console.log(data);
    token = data.token;
  });

  it('GET / getTicketDetails', async () => {
    const res = await requester
        .get(`/api/${process.env.api}/ticket/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({});
    console.log(res.body);
    expect(res.statusCode).to.equal(403);
    expect(res.body.message).to.equal('Not authorized to access this page');
  });
});


describe('ticket / reserveTickets', async () => {
  let id; // event_id
  it('POST / reserveTickets: no token', async () => {
    const token = 'null';
    const res = await requester
        .post(`/api/${process.env.api}/event/${id}/tickets/reserve`)
        .set('Authorization', `Bearer ${token}`)
        .send({});
    console.log(res.body);
    expect(res.body).to.equal('No token');
  });

  const user1 = users[3]; // test10
  const user = {
    email: user1.email,
    password: user1.password,
  };
  let token11;
  before(async () => {
    const res = await requester
        .post('/user/login')
        .send(user);
    const data = res.body;
    console.log(data);
    token11 = data.token;
  });

  const reserveTix = reserveTickets;
  it('POST / reserveTickets: one ticket type, one ticket', async () => {
    id = 3;
    const tickets = {
      event_id: reserveTix[0].event_id,
      ticket_type: reserveTix[0].ticket_type,
      ticket_number: reserveTix[0].ticket_number,
    };
    const res = await requester
        .post(`/api/${process.env.api}/event/${id}/tickets/reserve`)
        .set('Authorization', `Bearer ${token11}`)
        .send(tickets);
    console.log(res.body);
    expect(res.statusCode).to.equal(200);
    expect(res.body.status).to.equal(1);
    // expect(res.body.status).to.equal(1);
  });
  it('POST / reserveTickets: 2 ticket types', async () => {
    id = 2;
    const tickets = {
      event_id: reserveTix[1].event_id,
      ticket_type: reserveTix[1].ticket_type,
      ticket_number: reserveTix[1].ticket_number,
    };
    const res = await requester
        .post(`/api/${process.env.api}/event/${id}/tickets/reserve`)
        .set('Authorization', `Bearer ${token11}`)
        .send(tickets);
    console.log(res.body);
    expect(res.statusCode).to.equal(200);
    expect(res.body.status).to.equal(1);
  });
});

describe('ticket / reserveTickets: only 1 ticket left but want to reserve 4', async () => {
  const eventId = 8;
  const limit = 79;
  const user1 = users[3];
  const user = {
    email: user1.email,
    password: user1.password,
  };
  let token11;
  const fakeDataModel = require('./fake-data-adjustment');
  // set the stage
  before(async () => {
    await fakeDataModel.reserveTicketsOnlyOneTest(eventId, limit);
    const res = await requester
        .post('/user/login')
        .send(user);
    const data = res.body;
    console.log(data);
    token11 = data.token;
  });

  // grab all tickets of a pool except for 1
  it('POST / reserveTickets: reserve 4 tickets when only 1 is left, should return 1 ticket reserved', async () => {
    const id = 8;
    const tickets = {
      event_id: '8',
      ticket_type: ['Standard Admission'],
      ticket_number: ['4'],
    };
    const res = await requester
        .post(`/api/${process.env.api}/event/${id}/tickets/reserve`)
        .set('Authorization', `Bearer ${token11}`)
        .send(tickets);
    console.log(res.body);
    expect(res.statusCode).to.equal(200);
  });

  // restore tickets status
  after(async () => {
    await fakeDataModel.reserveTicketsOnlyOneTest(eventId, limit);
  });
});
