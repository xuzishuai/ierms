const dataPool = require('../util/dataPool');
const Promise = require('promise');

exports.getParentMenu = function () {
    return new Promise(async function (resolve, reject) {
        try {
            let menus = await dataPool.query('select * from menu where parent_id is null');
            resolve(menus);
        } catch (error) {
            reject(error);
        }
    })
};

exports.getSubMenu = function () {
    return new Promise(async function (resolve, reject) {
        try {
            let menus = await dataPool.query('select * from menu where parent_id is not null and children_ids is not null');
            resolve(menus);
        } catch (error) {
            reject(error);
        }
    })
};

exports.getChildrenMenu = function (ids) {
    return new Promise(async function (resolve, reject) {
        try {
            let menus = await dataPool.query('select * from menu where id in ( ? ) and children_ids is null', [ids]);
            resolve(menus);
        } catch (error) {
            reject(error);
        }
    })
};

exports.getSubMenuByPId = function (parent_id) {
    return new Promise(async function (resolve, reject) {
        try {
            let menus = await dataPool.query('select * from menu where parent_id=?', [parent_id]);
            resolve(menus);
        } catch (error) {
            reject(error);
        }
    })
};