const API_URL = 'http://localhost:3000/api/students';

const form = document.getElementById('student-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const studentIdInput = document.getElementById('student-id');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const courseInput = document.getElementById('course');
const tbody = document.getElementById('students-tbody');
const noStudentsMsg = document.getElementById('no-students');

let isEditing = false;

document.addEventListener('DOMContentLoaded', fetchStudents);

form.addEventListener('submit', handleSubmit);
cancelBtn.addEventListener('click', resetForm);

async function fetchStudents() {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();
        renderStudents(students);
    } catch (error) {
        console.error('Error fetching students:', error);
    }
}

function renderStudents(students) {
    tbody.innerHTML = '';

    if (students.length === 0) {
        noStudentsMsg.classList.remove('hidden');
        return;
    }

    noStudentsMsg.classList.add('hidden');

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(student.name)}</td>
            <td>${escapeHtml(student.email)}</td>
            <td>${escapeHtml(student.course)}</td>
            <td>
                <button class="btn-edit" onclick="editStudent('${student.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteStudent('${student.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function handleSubmit(e) {
    e.preventDefault();

    const studentData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        course: courseInput.value.trim()
    };

    try {
        if (isEditing) {
            await fetch(`${API_URL}/${studentIdInput.value}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
        } else {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
        }

        resetForm();
        fetchStudents();
    } catch (error) {
        console.error('Error saving student:', error);
    }
}

async function editStudent(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const student = await response.json();

        studentIdInput.value = student.id;
        nameInput.value = student.name;
        emailInput.value = student.email;
        courseInput.value = student.course;

        isEditing = true;
        formTitle.textContent = 'Edit Student';
        submitBtn.textContent = 'Update Student';
        cancelBtn.classList.remove('hidden');

        nameInput.focus();
    } catch (error) {
        console.error('Error fetching student:', error);
    }
}

async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }

    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchStudents();
    } catch (error) {
        console.error('Error deleting student:', error);
    }
}

function resetForm() {
    form.reset();
    studentIdInput.value = '';
    isEditing = false;
    formTitle.textContent = 'Add New Student';
    submitBtn.textContent = 'Add Student';
    cancelBtn.classList.add('hidden');
}