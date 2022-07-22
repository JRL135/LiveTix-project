const users = [
  {
    name: 'test',
    email: 'test@test.com',
    password: 'test',
    role: 'user',
  },
  {
    name: 'test1',
    email: 'test1@test.com',
    password: 'test1',
    role: 'admin',
  },
  {
    name: 'test2',
    email: 'test2@test.com',
    password: 'test2',
    role: 'user',
  },
  // reserveTickets user
  {
    name: 'test11',
    email: 'test11@test.com',
    password: 'test11',
    role: 'user',
  },
];

const reserveTickets = [
  {
    event_id: '3',
    ticket_type: ['Standard Admission'],
    ticket_number: ['1'],
  },
  {
    event_id: '2',
    ticket_type: ['Zone A', 'Zone B'],
    ticket_number: ['1', '2'],
  },
];

module.exports = {users, reserveTickets};
