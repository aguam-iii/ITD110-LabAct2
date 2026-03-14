const API_URL = 'http://localhost:3000/api/students';

const form = document.getElementById('student-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const studentIdInput = document.getElementById('student-id');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const courseInput = document.getElementById('course');
const birthdateInput = document.getElementById('birthdate');
const phoneInput = document.getElementById('phone');
const tbody = document.getElementById('students-tbody');
const noStudentsMsg = document.getElementById('no-students');

// Add logs elements (for express middleware function, logger)
const logsContainer = document.createElement('div');
logsContainer.id = 'logs-container';
logsContainer.innerHTML = `
    <h2>API Request Logs</h2>
    <div class="logs-controls">
        <button id="refresh-logs-btn" class="btn-refresh">Refresh Logs</button>
        <span id="logs-count">Total logs: 0</span>
    </div>
    <div class="logs-table-container">
        <table id="logs-table">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Method</th>
                    <th>URL</th>
                    <th>Status</th>
                    <th>Response Time</th>
                </tr>
            </thead>
            <tbody id="logs-tbody">
            </tbody>
        </table>
        <p id="no-logs" class="hidden">No logs available.</p>
    </div>
`;
document.querySelector('.container').insertBefore(logsContainer, document.querySelector('.table-container'));

let isEditing = false;

document.addEventListener('DOMContentLoaded', () => {
    fetchStudents();
    fetchLogs();
});

// Add event listener for refresh logs button
document.getElementById('refresh-logs-btn').addEventListener('click', fetchLogs);

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

async function fetchLogs() {
    try {
        const response = await fetch('http://localhost:3000/api/logs');
        const data = await response.json();
        renderLogs(data.logs);
        document.getElementById('logs-count').textContent = `Total logs: ${data.totalLogs}`;
    } catch (error) {
        console.error('Error fetching logs:', error);
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
            <td>${escapeHtml(student.birthdate)}</td>
            <td>${escapeHtml(student.phone)}</td>
            <td>
                <button class="btn-edit" onclick="editStudent('${student.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteStudent('${student.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderLogs(logs) {
    const logsTbody = document.getElementById('logs-tbody');
    const noLogsMsg = document.getElementById('no-logs');
    
    logsTbody.innerHTML = '';

    if (logs.length === 0) {
        noLogsMsg.classList.remove('hidden');
        return;
    }

    noLogsMsg.classList.add('hidden');

    logs.forEach(log => {
        const row = document.createElement('tr');
        const time = new Date(log.timestamp).toLocaleTimeString();
        const statusClass = log.statusCode >= 400 ? 'status-error' : 'status-success';
        
        row.innerHTML = `
            <td>${time}</td>
            <td><span class="method-${log.method.toLowerCase()}">${log.method}</span></td>
            <td>${escapeHtml(log.url)}</td>
            <td><span class="status-code ${statusClass}">${log.statusCode}</span></td>
            <td>${log.responseTime}ms</td>
        `;
        logsTbody.appendChild(row);
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
        course: courseInput.value.trim(),
        birthdate: birthdateInput.value.trim(),
        phone: phoneInput.value.trim()
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
        fetchLogs();
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
        birthdateInput.value = student.birthdate;
        phoneInput.value = student.phone;

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
        fetchLogs();
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