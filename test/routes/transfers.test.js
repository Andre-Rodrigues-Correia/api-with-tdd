const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transfers';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAwLCJuYW1lIjoiVXNlciAjMSIsImVtYWlsIjoidXNlcjFAZW1haWwuY29tIn0.qO0dorWNjz0S1dk9g1xEUvoh8fVNqJk0lZeqmzZ8pmU';

beforeAll(async () => {
    // await app.db.migrate.rollback();
    // await app.db.migrate.latest();
    await app.db.seed.run();
});
test('should list only user transfers', () => {
    return request(app).get(MAIN_ROUTE)
        .set('authorization', `bearer ${TOKEN}`)
        .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].description).toEqual('transfer #1');
    });
});

test('should insert a transfer with success', () => {
    return request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${TOKEN}`)
        .send({
            description: 'Regular transfer',
            user_id: 100000,
            acc_origin_id: 100000,
            acc_destiny_id: 100001,
            ammount: 100,
            date: new Date(),
        })
        .then(async (res) => {
            expect(res.status).toEqual(201);
            expect(res.body.description).toEqual('Regular transfer');

            const transactions = await app.db('transactions').where({ transfer_id: res.body.id });
            expect(transactions).toHaveLength(2);
            expect(transactions[0].description).toEqual('Transfer to acc #100001');
            expect(transactions[1].description).toEqual('Transfer from acc #100000');
            expect(transactions[0].ammount).toEqual('-100.00');
            expect(transactions[1].ammount).toEqual('100.00');
            expect(transactions[0].acc_id).toEqual(100000);
            expect(transactions[1].acc_id).toEqual(100001);
    });
});
