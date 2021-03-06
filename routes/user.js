const express = require('express');
const router = express.Router();
const baseDAO = require('../dao/baseDAO');
const userDAO = require('../dao/userDAO');
const menuDAO = require('../dao/menuDAO');
const roleDAO = require('../dao/roleDAO');
const exceptionHelper = require("../helper/exceptionHelper");
const commonUtil = require('../util/commonUtil');

router.get('/login', function (req, res) {
    res.render('user/login', {hideLayout: true});
});

router.post('/do_login', async function (req, res) {
    try {
        let user = await userDAO.login(req.body.user_no, req.body.password);
        if (!user || user.length == 0) {
            throw '工号或密码错误';
        }
        req.session.user = user;
        if (user[0].id == '1cbb1360-d57d-11e7-9634-4d058774421e') {
            let parentMenus = await menuDAO.getParentMenu();
            let subMenuMap = {};
            for (let i = 0; i < parentMenus.length; i++) {
                subMenuMap[parentMenus[i].id] = await menuDAO.getSubMenuByPId(parentMenus[i].id);
            }
            let subMenus = await menuDAO.getSubMenu();
            let menuMap = {};
            for (let i = 0; i < subMenus.length; i++) {
                menuMap[subMenus[i].id] = await menuDAO.getChildrenMenu(subMenus[i].children_ids.split('#'));
            }
            req.session.parentMenus = parentMenus;
            req.session.subMenuMap = subMenuMap;
            req.session.menuMap = menuMap;
        } else {
            let role = await baseDAO.getById('role', user[0].role_id);
            if (role[0].menu_ids) {//若该角色配置了菜单
                let childrenIds = role[0].menu_ids.split('#');
                let parentMenus = await menuDAO.getParentMenuByCIds(childrenIds);
                let subMenuMap = {};
                for (let i = 0; i < parentMenus.length; i++) {
                    subMenuMap[parentMenus[i].id] = await menuDAO.getSubMenuByPIdCId(parentMenus[i].id, childrenIds);
                }
                let subMenus = await menuDAO.getSubMenuByCid(childrenIds);
                let menuMap = {};
                for (let i = 0; i < subMenus.length; i++) {
                    menuMap[subMenus[i].id] = await menuDAO.getChildrenMenuByIds(subMenus[i].children_ids.split('#'), childrenIds);
                }
                req.session.parentMenus = parentMenus;
                req.session.subMenuMap = subMenuMap;
                req.session.menuMap = menuMap;
                req.session.childrenMenus = await menuDAO.getChildrenMenu(childrenIds);
            } else {//若该角色一个菜单都没有
                req.session.parentMenus = [];
                req.session.subMenuMap = [];
                req.session.menuMap = {};
                req.session.childrenMenus = [];
            }
        }
        res.redirect('/');
    } catch (errorMessage) {
        res.render('user/login', {
            hideLayout: true,
            errorMessage: errorMessage,
            user_no: req.body.user_no
        });
    }
});

router.get('/logout', function (req, res) {
    req.session.user = false;
    res.redirect('/user/login');
});

router.get('/user_list', async function (req, res) {
    try {
        let users = await userDAO.getAllUser();
        let roles = await baseDAO.getAll('role');
        res.render('user/user_list', {
            currentUser: req.session.user[0],
            users: users,
            roleMap: commonUtil.toMap(roles)
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/new_user', async function (req, res) {
    try {
        let roles = await baseDAO.getAll('role');
        res.render('user/new_user', {roles: roles});
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/validate_user_no', async function (req, res) {
    try {
        let user = await userDAO.isUserExist(req.body.id, req.body.user_no);
        if (user && user.length > 0) {
            res.send(false);
        } else {
            res.send(true);
        }
    } catch (error) {
        res.send(false);
    }
});

router.post('/do_create_user', async function (req, res) {
    try {
        let user = {};
        user.user_no = req.body.user_no;
        user.name = req.body.name;
        user.role_id = req.body.role_id;
        await userDAO.saveUser(user);
        res.redirect('/user/user_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/edit_user', async function (req, res) {
    try {
        let user = await baseDAO.getById('user', req.query.id);
        let roles = await baseDAO.getAll('role');
        res.render('user/edit_user', {
            user: user[0],
            roles: roles
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_update_user', async function (req, res) {
    try {
        let user = await baseDAO.getById('user', req.body.id);
        user = user[0];
        user.user_no = req.body.user_no;
        user.name = req.body.name;
        user.role_id = req.body.role_id;
        await userDAO.updateUser(user);
        res.redirect('/user/user_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/delete_user', async function (req, res) {
    try {
        await baseDAO.deleteById('user', req.query.id);
        res.send({status: true});
    } catch (error) {
        exceptionHelper.sendException(res, error);
    }
});

router.get('/role_list', async function (req, res) {
    try {
        let roles = await baseDAO.getAll('role');
        res.render('user/role_list', {
            roles: roles,
            roleMap: commonUtil.toMap(roles)
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/new_role', async function (req, res) {
    try {
        let parentMenus = await menuDAO.getParentMenu();
        let menuMap = {};
        for (let i = 0; i < parentMenus.length; i++) {
            menuMap[parentMenus[i].id] = await menuDAO.getChildrenMenu(parentMenus[i].children_ids.split('#'));
        }
        res.render('user/new_role', {
            parentMenus: parentMenus,
            menuMap: menuMap
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/validate_role_name', async function (req, res) {
    try {
        let role = await roleDAO.isRoleExist(req.body.id, req.body.name);
        if (role && role.length > 0) {
            res.send(false);
        } else {
            res.send(true);
        }
    } catch (error) {
        res.send(false);
    }
});

router.post('/do_create_role', async function (req, res) {
    try {
        let role = {};
        role.name = req.body.name;
        role.menu_ids = "#";
        let menuIds = req.body.menu_ids;
        if (menuIds) {
            for (let i = 0; i < menuIds.length; i++) {
                role.menu_ids += menuIds[i] + "#";
            }
        }
        role.menu_ids = role.menu_ids=="#"?null:role.menu_ids;
        await roleDAO.saveRole(role);
        res.redirect('/user/role_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/edit_role', async function (req, res) {
    try {
        let role = await baseDAO.getById('role', req.query.id);
        let parentMenus = await menuDAO.getParentMenu();
        let menuMap = {};
        for (let i = 0; i < parentMenus.length; i++) {
            menuMap[parentMenus[i].id] = await menuDAO.getChildrenMenu(parentMenus[i].children_ids.split('#'));
        }
        res.render('user/edit_role', {
            role: role[0],
            parentMenus: parentMenus,
            menuMap: menuMap
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_update_role', async function (req, res) {
    try {
        let role = {};
        role.id = req.body.id;
        role.name = req.body.name;
        role.menu_ids = "#";
        let menuIds = req.body.menu_ids;
        if (menuIds) {
            if (!Array.isArray(menuIds)) {
                role.menu_ids += menuIds + "#";
            } else {
                for (let i = 0; i < menuIds.length; i++) {
                    role.menu_ids += menuIds[i] + "#";
                }
            }
        }
        role.menu_ids = role.menu_ids=="#"?null:role.menu_ids;
        await roleDAO.updateRole(role);
        res.redirect('/user/role_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/delete_role', async function (req, res) {
    try {
        await baseDAO.deleteById('role', req.query.id);
        res.redirect('/user/role_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/personal_profile', async function (req, res) {
    try {
        let roles = await baseDAO.getAll('role');
        res.render('user/personal_profile', {
            user: req.session.user[0],
            roleMap: commonUtil.toMap(roles)
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/validate_old_password', async function (req, res) {
    try {
        let user = await baseDAO.getById('user', req.body.id);
        if (user[0].password != req.body.old_password) {
            res.send(false);
        } else {
            res.send(true);
        }
    } catch (error) {
        res.send(false);
    }
});

router.post('/do_change_password', async function (req, res) {
    try {
        let user = await baseDAO.getById('user', req.body.id);
        user = user[0];
        user.password = req.body.new_password;
        req.session.user = false;
        await userDAO.updateUser(user);
        res.send({status: true});
    } catch (error) {
        exceptionHelper.sendException(res, error);
    }
});

router.post('/reset_password', async function (req, res) {
    try {
        let user = await baseDAO.getById('user', req.body.id);
        user = user[0];
        user.password = '123456';
        await userDAO.updateUser(user);
        res.send({status: true});
    } catch (error) {
        exceptionHelper.sendException(res, error);
    }
});

module.exports = router;