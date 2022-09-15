exports.up = (knex) => {
  return knex.schema.createTable('transactions', (t) => {
    t.increments('id').primary();
    t.string('description').notNullable();
    t.enum('type', ['I', 'O']).notNullable();
    t.date('date').notNullable();
    t.decimal('ammount', 15, 2).notNullable();
    t.boolean('status').notNullable().defaultTo(false);
    t.integer('acc_id').references('id').inTable('accounts').notNullable();
  });
};

exports.down = (knex) => {
    return knex.schema.dropTable('transactions');
};
