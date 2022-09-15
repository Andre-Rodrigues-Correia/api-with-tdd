module.exports = (app) => {
    const find = (filter = {}) => {
        return app.db('transfers').where(filter).select();
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

    return { find, save };
};
