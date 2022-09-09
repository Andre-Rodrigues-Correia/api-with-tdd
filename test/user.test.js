const request = require('supertest');

const app = require('../src/app');

test('should list all users', () => {
    return request(app).get('/users').then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0]).toHaveProperty('name', 'John Doe');
        });
});

test('shoul insert user with success', () => {
    return request(app).post('/users').send({
            name: 'matheus mitty',
            email: 'matheus@email.com',
        }).then((res) => {
            expect(res.status).toEqual(201);
            expect(res.body.name).toEqual('matheus mitty');
        });
});
