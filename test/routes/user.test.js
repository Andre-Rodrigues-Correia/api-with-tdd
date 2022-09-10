const request = require('supertest');

const app = require('../../src/app');

const email = `${Date.now()}@email.com`;
test('should list all users', () => {
    return request(app).get('/users').then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
});

test('shoul insert user with success', () => {
    return request(app).post('/users').send({
            name: 'Matheus Mitty',
            email,
            password: '1234',
        }).then((res) => {
            expect(res.status).toEqual(201);
            expect(res.body.name).toEqual('Matheus Mitty');
        });
});

test('should not isert user unnamed', () => {
    return request(app).post('/users').send({
        email: 'matheus@email.com',
        password: '1234',
    }).then((res) => {
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual('nome é um atributo obrigatório');
    });
});

test('should not insert user without e-mail', async () => {
    const result = await request(app).post('/users').send({
        name: 'Matheus Mitty',
        password: '1234',
    });
    expect(result.status).toEqual(400);
    expect(result.body.error).toEqual('e-mail é um atributo obrigatório');
});

test('should not insert user without password', (done) => {
    request(app).post('/users').send({
        name: 'Matheus Mitty',
        email: 'matheus@email.com',
    }).then((res) => {
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual('senha é um atributo obrigatório');
        done();
    })
    .catch((error) => done.fail(error));
});

test('should not insert user with existis e-mail', () => {
    return request(app).post('/users').send({
        name: 'Matheus Mitty',
        email,
        password: '1234',
    }).then((res) => {
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual('já existe um usuário com esse e-mail');
    });
});
