import secrets
from flask import Flask, render_template, request, redirect, session, url_for
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os


app = Flask(__name__)
app.secret_key = secrets.token_hex(32)


@app.route('/')
def index():
    if 'username' in session:
        return render_template('taskmaster.html', username=session['username'])
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = users.get(username)

        if user and check_password_hash(user['password'], password):
            session['username'] = username
            return redirect(url_for('index'))
        return 'Invalid credentials', 401

    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = generate_password_hash(request.form['password'])

        if username in users:
            return 'User already exists', 409

        users[username] = {'password': password}
        save_users(users)  # <-- save to file
        return redirect(url_for('login'))

    return render_template('register.html')


@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))

USERS_FILE = 'users.json'

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f)

users=load_users() #User DB

if __name__ == '__main__':
    app.run(debug=True)
