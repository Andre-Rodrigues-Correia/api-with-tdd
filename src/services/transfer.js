const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
    const find = (filter = {}) => {
        return app.db('transfers').where(filter).select();
    };
    const findOne = (filter = {}) => {
        return app.db('transfers').where(filter).first();
    };

    const validate = async (transfer) => {
        if (!transfer.description) {
            throw new ValidationError('descrição é um atributo obrigatório');
        }
        if (!transfer.ammount) {
            throw new ValidationError('valor é um atributo obrigatório');
        }
        if (!transfer.date) {
            throw new ValidationError('data é um atributo obrigatório');
        }
        if (!transfer.acc_origin_id) {
            throw new ValidationError('conta de origen é um atributo obrigatório');
        }
        if (!transfer.acc_destiny_id) {
            throw new ValidationError('conta de destino é um atributo obrigatório');
        }
        if (transfer.acc_origin_id === transfer.acc_destiny_id) {
            throw new ValidationError('não é possível transferir para mesma conta');
        }

        const accounts = await app.db('accounts').whereIn('id', [transfer.acc_origin_id, transfer.acc_destiny_id]);
        accounts.forEach((acc) => {
            if (acc.user_id !== parseInt(transfer.user_id, 10)) {
                throw new ValidationError('essa conta não pertence ao usuário');
            }
        });
    };

    const save = async (transfer) => {
        const result = await app.db('transfers').insert(transfer, '*');
        const tranferId = result[0].id;

        const transactions = [
            {
                description: `Transfer to acc #${transfer.acc_destiny_id}`,
                date: transfer.date,
                ammount: transfer.ammount * -1,
                type: 'O',
                acc_id: transfer.acc_origin_id,
                transfer_id: tranferId,
            },
            {
                description: `Transfer from acc #${transfer.acc_origin_id}`,
                date: transfer.date,
                ammount: transfer.ammount,
                type: 'I',
                acc_id: transfer.acc_destiny_id,
                transfer_id: tranferId,
            },
        ];

        await app.db('transactions').insert(transactions);
        return result;
    };

    const update = async (id, transfer) => {
        const result = await app.db('transfers').where({ id }).update(transfer, '*');

        const transactions = [
            {
                description: `Transfer to acc #${transfer.acc_destiny_id}`,
                date: transfer.date,
                ammount: transfer.ammount * -1,
                type: 'O',
                acc_id: transfer.acc_origin_id,
                transfer_id: id,
            },
            {
                description: `Transfer from acc #${transfer.acc_origin_id}`,
                date: transfer.date,
                ammount: transfer.ammount,
                type: 'I',
                acc_id: transfer.acc_destiny_id,
                transfer_id: id,
            },
        ];
        await app.db('transactions').where({ transfer_id: id }).del();
        await app.db('transactions').insert(transactions);
        return result;
    };

    const remove = async (id) => {
        await app.db('transactions').where({ transfer_id: id }).del();
        return app.db('transfers').where({ id }).del();
    };

    return {
        find, findOne, save, update, validate, remove,
    };
};
