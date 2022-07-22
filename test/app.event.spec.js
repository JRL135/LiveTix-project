const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const app = require('../app');
const requester = chai.request(app).keepOpen();
const assert = chai.assert;
const expect = chai.expect;
const {users} = require('./fake-data');

require('dotenv').config({path: '../.env'});

describe('event', async () => {
  const id = 1;
  it('GET / getAvailableTickets of different ticket types of the current event', async () => {
    const res = await requester
        .get(`/api/${process.env.api}/event/${id}/tickets`);
    // console.log(res.body);
    expect(res.statusCode).to.equal(200);
    expect(res.body[0].ticket_id).to.be.a('number');
    expect(res.body[0].type).to.be.a('string');
    expect(res.body[0].price).to.be.a('number');
  });
});

describe('event', async () => {
  const id = 1; // event_id
  const user1 = users[0];
  const user = {
    email: user1.email,
    password: user1.password,
  };
  // let userId;
  let token;
  before(async () => {
    const res = await requester
        .post('/user/login')
        .send(user);
    const data = res.body;
    console.log(data);
    token = data.token;
  });

  // 1st get: should get empty fav
  it('GET / getEventFavStatus of user favorite status of the current event', async () => {
    const res = await requester
        .get(`/api/${process.env.api}/event/${id}/user/favorite`)
        .set('Authorization', `Bearer ${token}`)
        .send({});
    console.log('-------get before post---------');
    // console.log(res.body);
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.equal(0);
  });

  // 1st post
  it('POST / postEventFavStatus of user favorite status of the current event', async () => {
    const res = await requester
        .post(`/api/${process.env.api}/event/${id}/user/favorite`)
        .set('Authorization', `Bearer ${token}`)
        .send({});
    // console.log(res.body);
    expect(res.statusCode).to.equal(200);
  });

  // 2nd get: should get fav status
  it('GET / getEventFavStatus of user favorite status of the current event', async () => {
    const res = await requester
        .get(`/api/${process.env.api}/event/${id}/user/favorite`)
        .set('Authorization', `Bearer ${token}`)
        .send({});
    console.log('-------get after post----------');
    // console.log(res.body);
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.equal(1);
  });

  it('DELETE / deleteEventFavStatus of user favorite status of the current event', async () => {
    const res = await requester
        .delete(`/api/${process.env.api}/event/${id}/user/favorite`)
        .set('Authorization', `Bearer ${token}`)
        .send({});
    // console.log(res.body);
    expect(res.statusCode).to.equal(200);
  });

  // final get: should empty fav status
  it('GET / getEventFavStatus of user favorite status of the current event', async () => {
    const res = await requester
        .get(`/api/${process.env.api}/event/${id}/user/favorite`)
        .set('Authorization', `Bearer ${token}`)
        .send({});
    console.log('-------get after delete-----------');
    // console.log(res.body);
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.equal(0);
  });
});

describe('event', async () => {
  it('GET / getCurrentEvents', async () => {
    const category = 'null';
    const res = await requester
        .get(`/api/${process.env.api}/events/${category}`);
    console.log(res.body);
    expect(res.statusCode).to.equal(200);
    expect(res.body.length).to.equal(11);
  });

  it('GET / getCurrentEvents', async () => {
    const category = 'concert';
    const res = await requester
        .get(`/api/${process.env.api}/events/${category}`);
    console.log(res.body);
    expect(res.statusCode).to.equal(200);
    expect(res.body.length).to.equal(9);
  });

  it('GET / getCurrentEvents', async () => {
    const category = 'festival';
    const res = await requester
        .get(`/api/${process.env.api}/events/${category}`);
    console.log(res.body);
    expect(res.statusCode).to.equal(200);
    expect(res.body.length).to.equal(2);
  });
});

