const request = require('supertest');
const moment = require('moment');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/balance';
const ROUTE_TRANSACTION = '/v1/transactions';
const ROUTE_TRANSFER = '/v1/transfers';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMDEwMCIsIm5hbWUiOiJVc2VyICMxIiwiZW1haWwiOiJ1c2VyM0BlbWFpbC5jb20ifQ.rgMcqSMHsNLuHDI2XBvPXrcUgFDZdYRUqYLH07q0_Mc';
const TOKEN_GERAL = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMDEwMiIsIm5hbWUiOiJVc2VyICM1IiwiZW1haWwiOiJ1c2VyNWVtYWlsLmNvbSJ9.dbItyf0VQiDRMAdhrMB9mdTpWFg4j0dL-abTMHVpWrg';

beforeAll(async () => {
    await app.db.seed.run();
  });

  describe('should calculate user balance', () => {
    test('should return accounts with transactions', () => {
      return request(app).get(MAIN_ROUTE)
        .set('authorization', `bearer ${TOKEN}`)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveLength(0);
        });
    });

    test('should add entry values', () => {
      return request(app).post(ROUTE_TRANSACTION)
        .send({
 description: '1', date: new Date(), ammount: 100, type: 'I', acc_id: 100100, status: true,
})
        .set('authorization', `bearer ${TOKEN}`)
        .then(() => {
          return request(app).get(MAIN_ROUTE)
            .set('authorization', `bearer ${TOKEN}`)
            .then((res) => {
              expect(res.status).toBe(200);
              expect(res.body).toHaveLength(1);
              expect(res.body[0].id).toBe(100100);
              expect(res.body[0].sum).toBe('100.00');
            });
        });
    });

    test('sould subtract exit values', () => {
      return request(app).post(ROUTE_TRANSACTION)
        .send({
 description: '1', date: new Date(), ammount: 200, type: 'O', acc_id: 100100, status: true,
})
        .set('authorization', `bearer ${TOKEN}`)
        .then(() => {
          return request(app).get(MAIN_ROUTE)
            .set('authorization', `bearer ${TOKEN}`)
            .then((res) => {
              expect(res.status).toBe(200);
              expect(res.body).toHaveLength(1);
              expect(res.body[0].id).toBe(100100);
              expect(res.body[0].sum).toBe('-100.00');
            });
        });
    });

    test('should not consider pendent transfers', () => {
      return request(app).post(ROUTE_TRANSACTION)
        .send({
 description: '1', date: new Date(), ammount: 200, type: 'O', acc_id: 100100, status: false,
})
        .set('authorization', `bearer ${TOKEN}`)
        .then(() => {
          return request(app).get(MAIN_ROUTE)
            .set('authorization', `bearer ${TOKEN}`)
            .then((res) => {
              expect(res.status).toBe(200);
              expect(res.body).toHaveLength(1);
              expect(res.body[0].id).toBe(100100);
              expect(res.body[0].sum).toBe('-100.00');
            });
        });
    });

    test('should not consider balance to distinty accounts', () => {
      return request(app).post(ROUTE_TRANSACTION)
        .send({
 description: '1', date: new Date(), ammount: 50, type: 'I', acc_id: 100101, status: true,
})
        .set('authorization', `bearer ${TOKEN}`)
        .then(() => {
          return request(app).get(MAIN_ROUTE)
            .set('authorization', `bearer ${TOKEN}`)
            .then((res) => {
              expect(res.status).toBe(200);
              expect(res.body).toHaveLength(2);
              expect(res.body[0].id).toBe(100100);
              expect(res.body[0].sum).toBe('-100.00');
              expect(res.body[1].id).toBe(100101);
              expect(res.body[1].sum).toBe('50.00');
            });
        });
    });

    test('shoult not consider account to other users', () => {
      return request(app).post(ROUTE_TRANSACTION)
        .send({
 description: '1', date: new Date(), ammount: 200, type: 'O', acc_id: 100102, status: true,
})
        .set('authorization', `bearer ${TOKEN}`)
        .then(() => {
          return request(app).get(MAIN_ROUTE)
            .set('authorization', `bearer ${TOKEN}`)
            .then((res) => {
              expect(res.status).toBe(200);
              expect(res.body).toHaveLength(2);
              expect(res.body[0].id).toBe(100100);
              expect(res.body[0].sum).toBe('-100.00');
              expect(res.body[1].id).toBe(100101);
              expect(res.body[1].sum).toBe('50.00');
            });
        });
    });

    test('should consider old transaction', () => {
      return request(app).post(ROUTE_TRANSACTION)
        .send({
 description: '1', date: moment().subtract({ days: 5 }), ammount: 250, type: 'I', acc_id: 100100, status: true,
})
        .set('authorization', `bearer ${TOKEN}`)
        .then(() => {
          return request(app).get(MAIN_ROUTE)
            .set('authorization', `bearer ${TOKEN}`)
            .then((res) => {
              expect(res.status).toBe(200);
              expect(res.body).toHaveLength(2);
              expect(res.body[0].id).toBe(100100);
              expect(res.body[0].sum).toBe('150.00');
              expect(res.body[1].id).toBe(100101);
              expect(res.body[1].sum).toBe('50.00');
            });
        });
    });

    test('should not consider future transaction', () => {
      return request(app).post(ROUTE_TRANSACTION)
        .send({
 description: '1', date: moment().add({ days: 5 }), ammount: 250, type: 'I', acc_id: 100100, status: true,
})
        .set('authorization', `bearer ${TOKEN}`)
        .then(() => {
          return request(app).get(MAIN_ROUTE)
            .set('authorization', `bearer ${TOKEN}`)
            .then((res) => {
              expect(res.status).toBe(200);
              expect(res.body).toHaveLength(2);
              expect(res.body[0].id).toBe(100100);
              expect(res.body[0].sum).toBe('150.00');
              expect(res.body[1].id).toBe(100101);
              expect(res.body[1].sum).toBe('50.00');
            });
        });
    });

    test('should consider transfer', () => {
      return request(app).post(ROUTE_TRANSFER)
        .send({
 description: '1', date: new Date(), ammount: 250, acc_origin_id: 100100, acc_destiny_id: 100101,
})
        .set('authorization', `bearer ${TOKEN}`)
        .then(() => {
          return request(app).get(MAIN_ROUTE)
            .set('authorization', `bearer ${TOKEN}`)
            .then((res) => {
              expect(res.status).toBe(200);
              expect(res.body).toHaveLength(2);
              expect(res.body[0].id).toBe(100100);
              expect(res.body[0].sum).toBe('-100.00');
              expect(res.body[1].id).toBe(100101);
              expect(res.body[1].sum).toBe('300.00');
            });
        });
    });

    test('should calculate balance for user account', () => {
        return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN_GERAL}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe(100104);
      expect(res.body[0].sum).toBe('162.00');
      expect(res.body[1].id).toBe(100105);
      expect(res.body[1].sum).toBe('-248.00');
    });
    });
  });
