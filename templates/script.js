
// Initialize tasks array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentCategory = 'All';
let currentSort = 'dueDate';
let currentPriority = 'all';

// Set current date
document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

// Task form submission
const taskForm = document.getElementById('task-form');
const addTaskBtn = document.getElementById('add-task-btn');

taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    addNewTask();
});

function addNewTask() {
    const taskInput = document.getElementById('task');
    const dateInput = document.getElementById('due-date');
    const reminderDateInput = document.getElementById('reminder-date');
    const reminderTimeInput = document.getElementById('reminder-time');
    const categoryInput = document.getElementById('category');
    const priorityInput = document.getElementById('priority');

    if (!taskInput.value.trim()) {
    alert('Please enter a task');
    return;
    }

    // Set due date
    let dueDate = null;
    if (dateInput.value) {
    const date = new Date(dateInput.value);
    dueDate = date.toISOString();
    }

    // Set reminder
    let reminder = null;
    if (reminderDateInput.value && reminderTimeInput.value) {
    const [hours, minutes] = reminderTimeInput.value.split(':');
    const reminderDate = new Date(reminderDateInput.value);
    reminderDate.setHours(parseInt(hours));
    reminderDate.setMinutes(parseInt(minutes));
    reminder = reminderDate.toISOString();
    }

    const newTask = {
    id: Date.now(),
    text: taskInput.value.trim(),
    dueDate: dueDate,
    reminder: reminder,
    category: categoryInput.value,
    priority: priorityInput.value,
    completed: false,
    createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();

    // Clear form inputs
    taskInput.value = '';
    dateInput.value = '';
    reminderDateInput.value = '';
    reminderTimeInput.value = '';
    categoryInput.selectedIndex = 0;
    priorityInput.selectedIndex = 0;
    reminderToggle.classList.remove('active');
    reminderOptions.style.display = 'none';

    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Task added successfully!';
    taskForm.appendChild(successMessage);

    // Remove success message after 2 seconds
    setTimeout(() => {
    successMessage.remove();
    }, 2000);

    // Schedule reminder if set
    if (reminder) {
    scheduleReminder(newTask);
    }
}

// Category button click handler
document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', function() {
    currentCategory = this.dataset.category;
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    this.classList.add('active');
    renderTasks();
    });
});

// Sort option click handler
const dueDateSortBtn = document.getElementById('dueDateSort');
let isSortingByDueDate = true;

dueDateSortBtn.addEventListener('click', function() {
    isSortingByDueDate = !isSortingByDueDate;
    this.classList.toggle('active');
    renderTasks();
});

// Priority filter click handler
document.querySelector('.filter-toggle-btn').addEventListener('click', function() {
    const optionsList = document.querySelector('.priority-options');
    const isVisible = optionsList.style.display !== 'none';
    optionsList.style.display = isVisible ? 'none' : 'block';
    this.textContent = isVisible ? 'Filter ▼' : 'Filter ▲';
});

document.querySelectorAll('.priority-option').forEach(option => {
    option.addEventListener('click', function() {
    currentPriority = this.dataset.priority;
    document.querySelectorAll('.priority-option').forEach(opt => {
        opt.classList.remove('active');
    });
    this.classList.add('active');
    renderTasks();
    });
});

// Toggle task completion
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Check if task is overdue
function isOverdue(task) {
    if (!task.dueDate) return false;
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate < now && !task.completed;
}

// Render tasks
function renderTasks() {
    const pendingTasksList = document.getElementById('pending-tasks');
    const completedTasksList = document.getElementById('completed-tasks');
    
    // Clear lists
    pendingTasksList.innerHTML = '';
    completedTasksList.innerHTML = '';

    // Filter tasks by category and priority
    let filteredTasks = tasks;
    if (currentCategory !== 'All') {
    filteredTasks = tasks.filter(task => task.category === currentCategory);
    }
    if (currentPriority !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.priority === currentPriority);
    }

    // Sort tasks
    if (isSortingByDueDate) {
    filteredTasks.sort((a, b) => {
        const now = new Date();
        
        // Helper function to get task status
        function getTaskStatus(task) {
        if (!task.dueDate) return 3; // No due date
        const dueDate = new Date(task.dueDate);
        if (dueDate < now && !task.completed) return 1; // Overdue
        return 2; // Upcoming
        }

        const statusA = getTaskStatus(a);
        const statusB = getTaskStatus(b);

        // First sort by status (overdue -> upcoming -> no due date)
        if (statusA !== statusB) {
        return statusA - statusB;
        }

        // If same status, sort by due date
        if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
        }
        
        return 0;
    });
    }

    // Add section headers for pending tasks
    let currentStatus = null;
    let statusHeader = null;

    // Render tasks
    filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    
    // Check task status
    const now = new Date();
    let taskStatus = 'upcoming';
    if (!task.dueDate) {
        taskStatus = 'no-due-date';
    } else if (new Date(task.dueDate) < now && !task.completed) {
        taskStatus = 'overdue';
        li.classList.add('overdue-task');
    }

    // Add status header if status changes and sorting by due date
    if (isSortingByDueDate && taskStatus !== currentStatus && !task.completed) {
        currentStatus = taskStatus;
        statusHeader = document.createElement('div');
        statusHeader.className = 'status-header';
        switch (taskStatus) {
        case 'overdue':
            statusHeader.textContent = '⚠️ Overdue Tasks';
            break;
        case 'upcoming':
            statusHeader.textContent = '📅 Upcoming Tasks';
            break;
        case 'no-due-date':
            statusHeader.textContent = '📌 Tasks Without Due Date';
            break;
        }
        pendingTasksList.appendChild(statusHeader);
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';

    const taskDetails = document.createElement('div');
    taskDetails.className = 'task-details';

    const taskTitle = document.createElement('div');
    taskTitle.className = 'task-title';
    taskTitle.textContent = task.text;

    const taskDate = document.createElement('div');
    taskDate.className = 'task-date';
    taskDate.textContent = formatDate(task.dueDate);

    const badgesContainer = document.createElement('div');
    badgesContainer.className = 'task-badges';

    const priorityBadge = document.createElement('span');
    priorityBadge.className = `priority-badge priority-${task.priority}`;
    priorityBadge.textContent = task.priority;

    badgesContainer.appendChild(priorityBadge);

    if (taskStatus === 'overdue') {
        const overdueBadge = document.createElement('span');
        overdueBadge.className = 'overdue-badge';
        overdueBadge.textContent = 'Overdue';
        badgesContainer.appendChild(overdueBadge);
    }

    taskDetails.appendChild(taskTitle);
    taskDetails.appendChild(taskDate);
    taskContent.appendChild(taskDetails);
    taskContent.appendChild(badgesContainer);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.title = 'Delete task';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(taskContent);
    li.appendChild(deleteBtn);
    
    if (task.completed) {
        taskTitle.style.textDecoration = 'line-through';
        completedTasksList.appendChild(li);
    } else {
        pendingTasksList.appendChild(li);
    }

    // Add reminder if set
    if (task.reminder) {
        const reminderDate = new Date(task.reminder);
        const reminderText = document.createElement('div');
        reminderText.className = 'task-reminder';
        reminderText.textContent = `Reminder: ${reminderDate.toLocaleString()}`;
        taskContent.appendChild(reminderText);
    }
    });
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
    return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
    } else {
    return date.toLocaleDateString();
    }
}

// Delete task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    }
}

// Theme switching functionality
const themeSwitch = document.getElementById('theme-switch');

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

function updateThemeIcon(theme) {
    themeSwitch.innerHTML = theme === 'light' ? '🌙' : '☀️';
    themeSwitch.title = `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`;
}

themeSwitch.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

// Initial render
renderTasks();

// Add initial active states
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.category-btn[data-category="All"]').classList.add('active');
    document.getElementById('dueDateSort').classList.add('active');
    document.querySelector('.priority-option[data-priority="all"]').classList.add('active');
});

// Reminder toggle functionality
const reminderToggle = document.getElementById('reminder-toggle');
const reminderOptions = document.getElementById('reminder-options');

reminderToggle.addEventListener('click', function() {
    this.classList.toggle('active');
    const isVisible = reminderOptions.style.display !== 'none';
    reminderOptions.style.display = isVisible ? 'none' : 'block';
});

// Schedule reminder notification
function scheduleReminder(task) {
    const reminderTime = new Date(task.reminder);
    const now = new Date();
    const timeUntilReminder = reminderTime - now;

    if (timeUntilReminder > 0) {
    setTimeout(() => {
        if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification('Task Reminder', {
            body: `Reminder: ${task.text}`,
            icon: '🔔'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('Task Reminder', {
                body: `Reminder: ${task.text}`,
                icon: '🔔'
                });
            }
            });
        }
        }
    }, timeUntilReminder);
    }
}

// Request notification permission on page load
document.addEventListener('DOMContentLoaded', function() {
    if ('Notification' in window) {
    Notification.requestPermission();
    }
});