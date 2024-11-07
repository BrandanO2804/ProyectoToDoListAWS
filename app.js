// Importar AWS Amplify
import { Auth } from 'aws-amplify';
import awsconfig from './aws-exports';  // Asegúrate de que este archivo esté configurado correctamente
Auth.configure(awsconfig);

// Event listeners para los formularios y botones específicos
document.addEventListener('DOMContentLoaded', () => {
    const addTaskForm = document.getElementById('add-task-form');
    const editTaskForm = document.getElementById('edit-task-form');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (addTaskForm) addTaskForm.addEventListener('submit', addTask);
    if (editTaskForm) editTaskForm.addEventListener('submit', editTask);
    if (loginForm) loginForm.addEventListener('submit', loginUser);
    if (registerForm) registerForm.addEventListener('submit', registerUser);
    if (document.getElementById('clear-completed')) {
        document.getElementById('clear-completed').addEventListener('click', clearCompleted);
    }
    
    loadTasks();
});

// Función para agregar una tarea
async function addTask(event) {
    event.preventDefault();
    const taskText = document.getElementById('task-name').value;
    const taskDescription = document.getElementById('task-description').value;
    const taskDeadline = document.getElementById('task-deadline').value;

    if (taskText) {
        await fetch('API_ENDPOINT', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: taskText, description: taskDescription, deadline: taskDeadline })
        });
        loadTasks();
        document.getElementById('task-name').value = '';
        document.getElementById('task-description').value = '';
        document.getElementById('task-deadline').value = '';
    }
}

// Función para cargar tareas
async function loadTasks() {
    const response = await fetch('API_ENDPOINT');
    const tasks = await response.json();
    const tasksList = document.getElementById('tasks-list');
    if (tasksList) {
        tasksList.innerHTML = '';
        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <span ${task.completed ? 'class="completed"' : ''}>${task.text}</span>
                <button onclick="completeTask('${task.id}')">Complete</button>
                <button onclick="deleteTask('${task.id}')">Delete</button>
                <button onclick="editTaskForm('${task.id}', '${task.text}', '${task.description}', '${task.deadline}')">Edit</button>
            `;
            tasksList.appendChild(taskItem);
        });
    }
}

// Función para completar una tarea
async function completeTask(id) {
    await fetch(`API_ENDPOINT/${id}`, { method: 'PUT' });
    loadTasks();
}

// Función para eliminar una tarea
async function deleteTask(id) {
    await fetch(`API_ENDPOINT/${id}`, { method: 'DELETE' });
    loadTasks();
}

// Función para limpiar tareas completadas
async function clearCompleted() {
    await fetch('API_ENDPOINT/clear-completed', { method: 'DELETE' });
    loadTasks();
}

// Función para editar una tarea
function editTaskForm(id, text, description, deadline) {
    document.getElementById('edit-task-name').value = text;
    document.getElementById('edit-task-description').value = description;
    document.getElementById('edit-task-deadline').value = deadline;
    document.getElementById('edit-task-id').value = id;
}

async function editTask(event) {
    event.preventDefault();
    const id = document.getElementById('edit-task-id').value;
    const updatedTask = {
        text: document.getElementById('edit-task-name').value,
        description: document.getElementById('edit-task-description').value,
        deadline: document.getElementById('edit-task-deadline').value
    };

    await fetch(`API_ENDPOINT/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
    });
    loadTasks();
}

// Función para iniciar sesión
async function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const user = await Auth.signIn(email, password);
        alert('Inicio de sesión exitoso');
        window.location.href = 'index.html';  // Redireccionar al listado de tareas
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        alert('Error al iniciar sesión: ' + error.message);
    }
}

// Función para registrar un nuevo usuario
async function registerUser(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const { user } = await Auth.signUp({
            username: email,
            password,
            attributes: {
                email,
                name: username,
            },
        });
        alert('Registro exitoso. Revisa tu correo electrónico para verificar tu cuenta.');
        showLoginForm();  // Cambia al formulario de login
    } catch (error) {
        console.error('Error al registrarse:', error);
        alert('Error al registrarse: ' + error.message);
    }
}

// Función para recuperar contraseña
async function recoverPassword() {
    const email = prompt("Introduce tu correo electrónico para recuperar la contraseña:");
    if (!email) return;

    try {
        await Auth.forgotPassword(email);
        alert('Se ha enviado un correo para la recuperación de contraseña');
    } catch (error) {
        console.error('Error al recuperar contraseña:', error);
        alert('Error al recuperar contraseña: ' + error.message);
    }
}

// Función para alternar entre formularios de registro y login
function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}
