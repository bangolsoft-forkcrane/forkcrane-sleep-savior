const { Client } = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'dev-forkcrane-platform.c23yjqgasmo4.ap-northeast-2.rds.amazonaws.com',
    database: 'forkcrane_platform',
    password: 'vhzm1205',
    port: 5432,
});
client.connect();

const query = (text, params) => client.query(text, params);

const close = () => client.end();

module.exports = {
    query,
    close
};