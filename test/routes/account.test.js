const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/accounts';
let user;

beforeAll(async () => {
    const res = await app.services.user.save({
        name: 'user Account',
        email: `${Date.now()}@email.com`,
        password: '1234',
    });

    user = { ...res[0] };
});

test('should insert account with success', () => {
    return request(app).post(MAIN_ROUTE).send({
        name: 'Acc #1',
        user_id: user.id,
    }).then((result) => {
        expect(result.status).toEqual(201);
        expect(result.body.name).toEqual('Acc #1');
    });
});

test('should list all accounts with success', () => {
    return app.db('accounts').insert({ name: 'Acc list', user_id: user.id })
        .then(() => request(app).get(MAIN_ROUTE))
        .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
});

test('should return a account per id', () => {
    return app.db('accounts').insert({ name: 'Acc by Id', user_id: user.id }, ['id'])
        .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`))
        .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.name).toEqual('Acc by Id');
            expect(res.body.user_id).toEqual(user.id);
        });
});
