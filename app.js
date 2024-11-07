// app.js
document.getElementById('task-form').addEventListener('submit', addTask);
document.getElementById('clear-completed').addEventListener('click', clearCompleted);

async function addTask(event) {
    event.preventDefault();
    const taskText = document.getElementById('task-input').value;
    if (taskText) {
        await fetch('API_ENDPOINT', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: taskText })
        });
        loadTasks();
        document.getElementById('task-input').value = '';
    }
}

async function loadTasks() {
    const response = await fetch('API_ENDPOINT');
    const tasks = await response.json();
    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = '';
    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <span ${task.completed ? 'class="completed"' : ''}>${task.text}</span>
            <button onclick="completeTask('${task.id}')">Complete</button>
            <button onclick="deleteTask('${task.id}')">Delete</button>
        `;
        tasksList.appendChild(taskItem);
    });
}

async function completeTask(id) {
    await fetch(`API_ENDPOINT/${id}`, { method: 'PUT' });
    loadTasks();
}

async function deleteTask(id) {
    await fetch(`API_ENDPOINT/${id}`, { method: 'DELETE' });
    loadTasks();
}

async function clearCompleted() {
    await fetch('API_ENDPOINT/clear-completed', { method: 'DELETE' });
    loadTasks();
}

loadTasks(); // Load tasks on page load
