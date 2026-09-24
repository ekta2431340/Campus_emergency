"""
Authentication Routes
Context-Aware AI Campus Emergency Orchestration System
Author: BCA Final Year Project
"""

from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from app.models import db, User, ResponderProfile

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        if current_user.role == 'Admin':
            return redirect(url_for('admin.dashboard'))
        elif current_user.role == 'Responder':
            return redirect(url_for('responder.dashboard'))
        return redirect(url_for('student.dashboard'))

    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        remember = bool(request.form.get('remember'))

        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            login_user(user, remember=remember)
            flash(f"Welcome back, {user.name} ({user.role})!", "success")
            
            next_page = request.args.get('next')
            if next_page:
                return redirect(next_page)
            if user.role == 'Admin':
                return redirect(url_for('admin.dashboard'))
            elif user.role == 'Responder':
                return redirect(url_for('responder.dashboard'))
            return redirect(url_for('student.dashboard'))
        else:
            flash("Invalid email or password. Please try again.", "danger")

    return render_template('auth/login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('student.dashboard'))

    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        phone = request.form.get('phone', '').strip()
        campus_id = request.form.get('campus_id', '').strip()
        role = request.form.get('role', 'Student')

        if password != confirm_password:
            flash("Passwords do not match.", "danger")
            return render_template('auth/register.html')

        if User.query.filter_by(email=email).first():
            flash("An account with this email already exists.", "warning")
            return render_template('auth/register.html')

        new_user = User(
            name=name,
            email=email,
            role=role if role in ['Student', 'Responder'] else 'Student',
            phone=phone,
            campus_id=campus_id
        )
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        # If responder, create profile
        if new_user.role == 'Responder':
            prof = ResponderProfile(
                user_id=new_user.id,
                specialization="General",
                current_status="Available",
                latitude=12.9716,
                longitude=77.5946
            )
            db.session.add(prof)
            db.session.commit()

        flash("Registration successful! You may now sign in.", "success")
        return redirect(url_for('auth.login'))

    return render_template('auth/register.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash("You have been signed out safely.", "info")
    return redirect(url_for('auth.login'))

@auth_bp.route('/quick-login/<role>')
def quick_login(role):
    """
    Convenient viva/demo utility to swiftly toggle roles:
    role can be 'student', 'admin', or 'responder'
    """
    role_map = {
        'student': 'student@campus.edu',
        'admin': 'admin@campus.edu',
        'responder': 'responder.fire@campus.edu'
    }
    target_email = role_map.get(role.lower(), 'student@campus.edu')
    user = User.query.filter_by(email=target_email).first()
    if user:
        login_user(user)
        flash(f"Switched role to {user.name} ({user.role}) for demonstration.", "info")
        if user.role == 'Admin':
            return redirect(url_for('admin.dashboard'))
        elif user.role == 'Responder':
            return redirect(url_for('responder.dashboard'))
    return redirect(url_for('student.dashboard'))
