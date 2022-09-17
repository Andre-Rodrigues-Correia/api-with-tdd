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

describe('should save a valid transfer', () => {
    let transferId;
    let income;
    let outcome;
    test('should return status 201 and tranfers datas', () => {
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
            transferId = res.body.id;
        });
    });

    test('should ganerate equivalentstransactions', async () => {
        const transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('ammount');
        expect(transactions).toHaveLength(2);
        [outcome, income] = transactions;
    });

    test('should have negative exit trasactions', () => {
        expect(outcome.description).toEqual('Transfer to acc #100001');
        expect(outcome.ammount).toEqual('-100.00');
        expect(outcome.acc_id).toEqual(100000);
        expect(outcome.type).toEqual('O');
    });

    test('should have positive input trasactions', () => {
        expect(income.description).toEqual('Transfer from acc #100000');
        expect(income.ammount).toEqual('100.00');
        expect(income.acc_id).toEqual(100001);
        expect(income.type).toEqual('I');
    });

    test('should both reference to origin', () => {
        expect(income.transfer_id).toEqual(transferId);
        expect(outcome.transfer_id).toEqual(transferId);
    });
});

describe('should not save invalid tranfer', () => {
    const validTransfer = {
        description: 'Regular transfer',
        user_id: 100000,
        acc_origin_id: 100000,
        acc_destiny_id: 100001,
        ammount: 100,
        date: new Date(),
    };

    const template = (newData, errorMessage) => {
        return request(app).post(MAIN_ROUTE)
            .set('authorization', `bearer ${TOKEN}`)
            .send({ ...validTransfer, ...newData })
            .then((res) => {
                expect(res.status).toEqual(400);
                expect(res.body.error).toEqual(errorMessage);
        });
    };

    test('should not insert without description', () => template({ description: null }, 'descrição é um atributo obrigatório'));

    test('should not insert without value', () => template({ ammount: null }, 'valor é um atributo obrigatório'));

    test('should not insert without date', () => template({ date: null }, 'data é um atributo obrigatório'));

    test('should not insert without orgin account', () => template({ acc_origin_id: null }, 'conta de origen é um atributo obrigatório'));

    test('should not insert without destiny account', () => template({ acc_destiny_id: null }, 'conta de destino é um atributo obrigatório'));

    test('should not insert if origin account and destiny account are the same', () => template({ acc_destiny_id: 100000 }, 'não é possível transferir para mesma conta'));

    test('should not insert if origin account and destiny account are the same', () => template({ acc_origin_id: 100002 }, 'essa conta não pertence ao usuário'));
});

test('should return a only transfer per id', () => {
    return request(app).get(`${MAIN_ROUTE}/100000`)
        .set('authorization', `bearer ${TOKEN}`)
        .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.description).toEqual('transfer #1');
    });
});

describe('should update a valid transfer', () => {
    let transferId;
    let income;
    let outcome;
    test('should return status 200 and tranfers datas', () => {
        return request(app).put(`${MAIN_ROUTE}/100000`)
        .set('authorization', `bearer ${TOKEN}`)
        .send({
            description: 'transfer updated',
            user_id: 100000,
            acc_origin_id: 100000,
            acc_destiny_id: 100001,
            ammount: 500,
            date: new Date(),
        })
        .then(async (res) => {
            expect(res.status).toEqual(200);
            expect(res.body.description).toEqual('transfer updated');
            expect(res.body.ammount).toEqual('500.00');
            transferId = res.body.id;
        });
    });

    test('should ganerate equivalentstransactions', async () => {
        const transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('ammount');
        expect(transactions).toHaveLength(2);
        [outcome, income] = transactions;
    });

    test('should have negative exit trasactions', () => {
        expect(outcome.description).toEqual('Transfer to acc #100001');
        expect(outcome.ammount).toEqual('-500.00');
        expect(outcome.acc_id).toEqual(100000);
        expect(outcome.type).toEqual('O');
    });

    test('should have positive input trasactions', () => {
        expect(income.description).toEqual('Transfer from acc #100000');
        expect(income.ammount).toEqual('500.00');
        expect(income.acc_id).toEqual(100001);
        expect(income.type).toEqual('I');
    });

    test('should both reference to origin', () => {
        expect(income.transfer_id).toEqual(transferId);
        expect(outcome.transfer_id).toEqual(transferId);
    });
});

describe('should not save invalid tranfer', () => {
    const validTransfer = {
        description: 'Regular transfer',
        user_id: 100000,
        acc_origin_id: 100000,
        acc_destiny_id: 100001,
        ammount: 100,
        date: new Date(),
    };

    const template = (newData, errorMessage) => {
        return request(app).put(`${MAIN_ROUTE}/100000`)
            .set('authorization', `bearer ${TOKEN}`)
            .send({ ...validTransfer, ...newData })
            .then((res) => {
                expect(res.status).toEqual(400);
                expect(res.body.error).toEqual(errorMessage);
        });
    };

    test('should not insert without description', () => template({ description: null }, 'descrição é um atributo obrigatório'));

    test('should not insert without value', () => template({ ammount: null }, 'valor é um atributo obrigatório'));

    test('should not insert without date', () => template({ date: null }, 'data é um atributo obrigatório'));

    test('should not insert without orgin account', () => template({ acc_origin_id: null }, 'conta de origen é um atributo obrigatório'));

    test('should not insert without destiny account', () => template({ acc_destiny_id: null }, 'conta de destino é um atributo obrigatório'));

    test('should not insert if origin account and destiny account are the same', () => template({ acc_destiny_id: 100000 }, 'não é possível transferir para mesma conta'));

    test('should not insert if origin account and destiny account are the same', () => template({ acc_origin_id: 100002 }, 'essa conta não pertence ao usuário'));
});

describe('should remove transfer', () => {
    test('should return status 204', () => {
        return request(app).delete(`${MAIN_ROUTE}/100000`)
            .set('authorization', `bearer ${TOKEN}`)
            .then((res) => {
                expect(res.status).toEqual(204);
        });
    });

    test('should delete registro to database', () => {
        return app.db('transfers').where({ id: 100000 })
            .then((result) => {
                expect(result).toHaveLength(0);
            });
    });

    test('should remove associates transactions', () => {
        return app.db('transactions').where({ transfer_id: 100000 })
            .then((result) => {
                expect(result).toHaveLength(0);
            });
    });
});

test('should not return transfers to other user', () => {
    return request(app).get(`${MAIN_ROUTE}/100001`)
        .set('authorization', `bearer ${TOKEN}`)
        .then((res) => {
            expect(res.status).toEqual(403);
            expect(res.body.error).toEqual('este recurso não pertence ao usuário');
    });
});
