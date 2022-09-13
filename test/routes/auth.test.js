const request = require('supertest');
const app = require('../../src/app');

test('should create user via signup', () => {
    return request(app).post('/auth/signup').send({
        name: 'walter',
        email: `${Date.now()}@email.com`,
        password: '1234',
    }).then((res) => {
        expect(res.status).toEqual(201);
        expect(res.body.name).toEqual('walter');
        expect(res.body).toHaveProperty('email');
        expect(res.body).not.toHaveProperty('password');
    });
});
test('Should receiver token to login', () => {
    const email = `${Date.now()}@email.com`;
    return app.services.user.save({
        name: 'Walter',
        email,
        password: '1234',
    }).then(() => request(app).post('/auth/signin')
        .send({ email, password: '1234' }))
        .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body).toHaveProperty('token');
        });
});

test('should not authenticate user with incorrect password', () => {
    const email = `${Date.now()}@email.com`;
    return app.services.user.save({
        name: 'Walter',
        email,
        password: '1234',
    }).then(() => request(app).post('/auth/signin')
        .send({ email, password: '4321' }))
        .then((res) => {
            expect(res.status).toEqual(400);
            expect(res.body.error).toEqual('usuário ou senha incorreto');
        });
});

test('should authenticate with user not exitis', () => {
  return request(app).post('/auth/signin')
        .send({ email: 'incorrect@email.com', password: '4321' })
        .then((res) => {
            expect(res.status).toEqual(400);
            expect(res.body.error).toEqual('usuário ou senha incorreto');
        });
});

test('should not access proctect route without token', () => {
    return request(app).get('/users').then((res) => {
            expect(res.status).toEqual(401);
        });
});
