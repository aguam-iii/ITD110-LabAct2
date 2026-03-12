const express = require('express');
const router = express.Router();
const {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent
} = require('../controllers/studentController');

// Pre-hook middleware — runs before create and update
const validateStudent = (req, res, next) => {
    const { name, email, course } = req.body;

    // Validation: check required fields
    if (!name || !email || !course) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Sanitization: trim whitespace and lowercase email
    req.body.name = name.trim();
    req.body.email = email.toLowerCase().trim();
    req.body.course = course.trim();

    next(); // Pass to controller
};

router.route('/')
    .get(getStudents)
    .post(validateStudent, createStudent);

router.route('/:id')
    .get(getStudent)
    .put(validateStudent, updateStudent)
    .delete(deleteStudent);

module.exports = router;