const dataPool = require('../util/dataPool');
const Promise = require('promise');

exports.getById = function (table, id) {
    return new Promise(async function (resolve, reject) {
        try {
            let results = await dataPool.query('select * from ' + table + ' where id=?', [id]);
            resolve(results);
        } catch (error) {
            reject(error);
        }
    })
};

exports.getAll = function (table) {
    return new Promise(async function (resolve, reject) {
        try {
            let results = await dataPool.query('select * from ' + table);
            resolve(results);
        } catch (error) {
            reject(error);
        }
    })
};

exports.deleteById = function (table, id) {
    return new Promise(async function (resolve, reject) {
        try {
            await dataPool.query('delete from ' + table + ' where id=?', [id]);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};