// DOM Elements
const authContainer = document.getElementById('authContainer');
const appContainer = document.getElementById('appContainer');
const signInForm = document.getElementById('signInForm');
const signUpForm = document.getElementById('signUpForm');
const authToggleLink = document.getElementById('authToggleLink');
const authToggleText = document.getElementById('authToggleText');
const authMessage = document.getElementById('authMessage');
const userEmail = document.getElementById('userEmail');
const signOutBtn = document.getElementById('signOutBtn');
const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');

let currentUser = null;
let isSignInMode = true;

// Initialize app
async function init() {
    // Check for existing session
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        currentUser = session.user;
        showApp();
        loadTodos();
    } else {
        showAuth();
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            currentUser = session.user;
            showApp();
            loadTodos();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            showAuth();
        }
    });
}

// Show/Hide UI sections
function showAuth() {
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
}

function showApp() {
    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
    userEmail.textContent = currentUser.email;
}

// Auth toggle between sign in and sign up
authToggleLink.addEventListener('click', () => {
    isSignInMode = !isSignInMode;
    if (isSignInMode) {
        signInForm.classList.remove('hidden');
        signUpForm.classList.add('hidden');
        authToggleText.textContent = "Don't have an account? ";
        authToggleLink.textContent = 'Sign up';
    } else {
        signInForm.classList.add('hidden');
        signUpForm.classList.remove('hidden');
        authToggleText.textContent = 'Already have an account? ';
        authToggleLink.textContent = 'Sign in';
    }
    clearMessage();
});

// Sign In
signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        showMessage('Signed in successfully!', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    }
});

// Sign Up
signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;

    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) throw error;

        if (data.user) {
            showMessage('Account created successfully! You can now sign in.', 'success');
            // Switch to sign in form
            setTimeout(() => {
                authToggleLink.click();
            }, 2000);
        }
    } catch (error) {
        showMessage(error.message, 'error');
    }
});

// Sign Out
signOutBtn.addEventListener('click', async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    } catch (error) {
        console.error('Error signing out:', error);
    }
});

// Show message
function showMessage(message, type) {
    authMessage.innerHTML = `<div class="${type}-message">${message}</div>`;
    setTimeout(clearMessage, 5000);
}

function clearMessage() {
    authMessage.innerHTML = '';
}

// Load Todos
async function loadTodos() {
    try {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        displayTodos(data);
    } catch (error) {
        console.error('Error loading todos:', error);
        todoList.innerHTML = '<li class="loading">Error loading todos</li>';
    }
}

// Display Todos
function displayTodos(todos) {
    if (todos.length === 0) {
        todoList.innerHTML = '<li class="loading">No todos yet. Add one above!</li>';
        return;
    }

    todoList.innerHTML = todos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <input type="checkbox"
                   class="todo-checkbox"
                   ${todo.completed ? 'checked' : ''}
                   onchange="toggleTodo('${todo.id}', ${!todo.completed})">
            <span class="todo-text">${escapeHtml(todo.task)}</span>
            <button class="todo-delete" onclick="deleteTodo('${todo.id}')">Delete</button>
        </li>
    `).join('');
}

// Add Todo
addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

async function addTodo() {
    const task = todoInput.value.trim();
    if (!task) return;

    try {
        const { data, error } = await supabase
            .from('todos')
            .insert([
                {
                    task,
                    user_id: currentUser.id,
                    completed: false
                }
            ])
            .select();

        if (error) throw error;

        todoInput.value = '';
        loadTodos();
    } catch (error) {
        console.error('Error adding todo:', error);
        alert('Error adding todo: ' + error.message);
    }
}

// Toggle Todo
async function toggleTodo(id, completed) {
    try {
        const { error } = await supabase
            .from('todos')
            .update({ completed })
            .eq('id', id);

        if (error) throw error;

        loadTodos();
    } catch (error) {
        console.error('Error updating todo:', error);
        alert('Error updating todo: ' + error.message);
    }
}

// Delete Todo
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
        const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', id);

        if (error) throw error;

        loadTodos();
    } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Error deleting todo: ' + error.message);
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Start the app
init();
