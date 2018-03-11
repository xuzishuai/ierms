const express = require('express');
const router = express.Router();
const exceptionHelper = require("../helper/exceptionHelper");
const baseDAO = require('../dao/baseDAO');
const userDAO = require('../dao/userDAO');
const studentDAO = require('../dao/studentDAO');
const commonUtil = require('../util/commonUtil');
const dateUtil = require('../util/dateUtil');

router.get('/new_student', async function (req, res) {
    try {
        let grades = await baseDAO.getAll('grade');
        let advisers = await userDAO.getAllAdviser();
        let sources = await baseDAO.getAll('source');
        let howKnows = await baseDAO.getAll('how_know');
        res.render('student/new_student', {
            grades: grades,
            advisers: advisers,
            sources: sources,
            howKnows: howKnows
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_create_student', async function (req, res) {
    try {
        await studentDAO.saveStudent(req.body.name, req.body.gender, req.body.grade_id, req.body.contact, req.body.appointment_time,
            (req.body.source_id&&req.body.source_id!='')?req.body.source_id:null, (req.body.how_know_id&&req.body.how_know_id!='')?req.body.how_know_id:null,
            (req.body.note&&req.body.note!='')?req.body.note:null);
        res.send({status: true});
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/arrive_student_list', async function (req, res) {
    try {
        let condition = {};
        condition.name = req.query.name;
        condition.contact = req.query.contact;
        condition.grade_id = req.query.grade_id;
        condition.status = req.query.status!=null?req.query.status:0;
        condition.appointment_start_time = req.query.appointment_start_time;
        condition.appointment_end_time = req.query.appointment_end_time;
        condition.adviser_id = req.query.adviser_id;
        condition.source_id = req.query.source_id;
        let students = await studentDAO.getStudentByCondition(condition);
        let grades = await baseDAO.getAll('grade');
        let advisers = await userDAO.getAllAdviser();
        let sources = await baseDAO.getAll('source');
        res.render('student/arrive_student_list', {
            students: students,
            grades: grades,
            sources: sources,
            advisers: advisers,
            gradeMap: commonUtil.toMap(grades),
            adviserMap: commonUtil.toMap(advisers),
            sourceMap: commonUtil.toMap(sources),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/do_student_arrive', async function (req, res) {
    try {
        let student = {};
        student.id = req.query.id;
        student.status = 1;
        await studentDAO.doUpdateStudent(student);
        res.redirect('/student/arrive_student_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});


router.get('/assign_adviser_student_list', async function (req, res) {
    try {
        let condition = {};
        condition.name = req.query.name;
        condition.contact = req.query.contact;
        condition.grade_id = req.query.grade_id;
        condition.status = req.query.status;
        condition.appointment_start_time = req.query.appointment_start_time;
        condition.appointment_end_time = req.query.appointment_end_time;
        condition.adviser_id = req.query.adviser_id;
        condition.source_id = req.query.source_id;
        let students = await studentDAO.getStudentByCondition(condition);
        let grades = await baseDAO.getAll('grade');
        let advisers = await userDAO.getAllAdviser();
        let sources = await baseDAO.getAll('source');
        res.render('student/assign_adviser_student_list', {
            students: students,
            grades: grades,
            sources: sources,
            advisers: advisers,
            gradeMap: commonUtil.toMap(grades),
            adviserMap: commonUtil.toMap(advisers),
            sourceMap: commonUtil.toMap(sources),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/assign_adviser', async function (req, res) {
    try {
        let student = await baseDAO.getById('student', req.query.id);
        let grades = await baseDAO.getAll('grade');
        let advisers = await userDAO.getAllAdviser();
        let sources = await baseDAO.getAll('source');
        res.render('student/assign_adviser', {
            student: student[0],
            advisers: advisers,
            gradeMap: commonUtil.toMap(grades),
            adviserMap: commonUtil.toMap(advisers),
            sourceMap: commonUtil.toMap(sources),
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.post('/do_assign_adviser', async function (req, res) {
    try {
        let student = {};
        student.id = req.body.id;
        student.adviser_id = req.body.adviser_id;
        await studentDAO.doUpdateStudent(student);
        res.redirect('/student/assign_adviser_student_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/audit_student_list', async function (req, res) {
    try {
        let condition = {};
        condition.name = req.query.name;
        condition.contact = req.query.contact;
        condition.grade_id = req.query.grade_id;
        condition.audit_status = req.query.audit_status!=null?req.query.audit_status:0;
        condition.appointment_start_time = req.query.appointment_start_time;
        condition.appointment_end_time = req.query.appointment_end_time;
        condition.adviser_id = req.query.adviser_id;
        condition.source_id = req.query.source_id;
        let students = await studentDAO.getStudentByCondition(condition);
        let grades = await baseDAO.getAll('grade');
        let advisers = await userDAO.getAllAdviser();
        let sources = await baseDAO.getAll('source');
        res.render('student/audit_student_list', {
            students: students,
            grades: grades,
            sources: sources,
            advisers: advisers,
            gradeMap: commonUtil.toMap(grades),
            adviserMap: commonUtil.toMap(advisers),
            sourceMap: commonUtil.toMap(sources),
            condition: condition,
            dateUtil: dateUtil
        });
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

router.get('/do_audit_student', async function (req, res) {
    try {
        let student = {};
        student.id = req.query.id;
        student.audit_status = req.query.audit_status;
        await studentDAO.doUpdateStudent(student);
        res.redirect('/student/audit_student_list');
    } catch (error) {
        exceptionHelper.renderException(res, error);
    }
});

module.exports = router;