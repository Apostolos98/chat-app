const supertest = require('supertest');
const app = require('./app');

// Wrap your app with supertest
const request = supertest.agent(app);

request
  .post('/account/log-in') 
  .send({ username: 'asd', password: 'asd' })
  .expect(200) 
  .then(() => {
    console.log('successfully authenticated')
    // First authenticated request
    return request
      .get('/messages/chats')
      .expect(200)
  })
  .then(() => {
    console.log('First request passed!');
    // Second authenticated request
    return request
      .put('/messages/chats/6549fcb60b39b364d6254424')
      .send({ message: { value: 'hello from test' }})
      .expect(200)
  })
  .then(() => {
    console.log('Second request passed!')
    // Third authenticated request
    return request
        .post('/messages/chats')
        .send({ message: 'hello new firend with new chat', recipient: 'asdasdasd' })
        .expect(404)
  })
  .then(() => {
    console.log('Third request passed!')
    // Third authenticated request
    return request
        .post('/messages/chats')
        .send({ message: 'hello new firend with new chat', recipient: 'qwe' })
        .expect(409)
  })
  .then(() => {
    console.log('Fourth request passed!')
    // Third authenticated request
    return request
        .post('/messages/chats')
        .send({ message: 'hello new friend with new chat', recipient: 'zxc' })
        .expect(201)
  })
  .then(() => {
    console.log('Fifth request passed!');
    process.exit(); // end the process to prevent it from hanging
  })
  .catch(err => {
    if (err) throw err;
  });
