const request = require('supertest');

const app = require('../../src/app');

test('should list all users', () => {
    return request(app).get('/users').then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
});

test('shoul insert user with success', () => {
    const email = `${Date.now()}@email.com`;
    return request(app).post('/users').send({
            name: 'Matheus Mitty',
            email,
            password: '1234',
        }).then((res) => {
            expect(res.status).toEqual(201);
            expect(res.body.name).toEqual('Matheus Mitty');
        });
});
