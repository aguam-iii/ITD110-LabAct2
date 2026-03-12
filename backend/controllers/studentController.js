const { client } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const STUDENT_KEY = (id) => `student:${id}`;
const STUDENTS_SET = 'students';

// Get all students
const getStudents = async (req, res) => {
    try {
        const studentIds = await client.sMembers(STUDENTS_SET);
        const students = [];

        for (const id of studentIds) {
            const student = await client.hGetAll(STUDENT_KEY(id));
            if (student && student.id) {
                students.push(student);
            }
        }

        students.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single student
const getStudent = async (req, res) => {
    try {
        const student = await client.hGetAll(STUDENT_KEY(req.params.id));
        if (!student || !student.id) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create student
const createStudent = async (req, res) => {
    try {
        const { name, email, course } = req.body;

        if (!name || !email || !course) {
            return res.status(400).json({ message: 'Name, email, and course are required' });
        }

        const id = uuidv4();
        const now = new Date().toISOString();
        const student = { id, name, email: email.toLowerCase().trim(), course, createdAt: now, updatedAt: now };

        for (const [field, value] of Object.entries(student)) {
            await client.hSet(STUDENT_KEY(id), field, value);
        }
        await client.sAdd(STUDENTS_SET, id);

        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update student
const updateStudent = async (req, res) => {
    try {
        const exists = await client.exists(STUDENT_KEY(req.params.id));
        if (!exists) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const { name, email, course } = req.body;
        const updates = { updatedAt: new Date().toISOString() };
        if (name) updates.name = name;
        if (email) updates.email = email.toLowerCase().trim();
        if (course) updates.course = course;

        for (const [field, value] of Object.entries(updates)) {
            await client.hSet(STUDENT_KEY(req.params.id), field, value);
        }
        const student = await client.hGetAll(STUDENT_KEY(req.params.id));

        res.json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete student
const deleteStudent = async (req, res) => {
    try {
        const exists = await client.exists(STUDENT_KEY(req.params.id));
        if (!exists) {
            return res.status(404).json({ message: 'Student not found' });
        }

        await client.del(STUDENT_KEY(req.params.id));
        await client.sRem(STUDENTS_SET, req.params.id);

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent
};