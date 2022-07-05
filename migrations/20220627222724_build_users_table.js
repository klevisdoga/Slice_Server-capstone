exports.up = function(knex) {
    return knex.schema.createTable('users', (table) => {
        table.string('user_id').unique().primary();
        table.string('firstName').notNullable();
        table.string('lastName').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.text('subscriptions').notNullable();
        table.string('connected').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
