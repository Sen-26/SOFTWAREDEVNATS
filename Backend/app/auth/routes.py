from flask import Blueprint, request, jsonify, current_app
from app.models import User
from app import db
import jwt
import datetime
from functools import wraps
from datetime import date, timedelta

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except Exception:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing username or password'}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'User already exists'}), 400
    user = User(username=data['username'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'})

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    if user and user.check_password(data.get('password')):
        update_streak(user)
        db.session.commit()
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, current_app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({'token': token})
    return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/me/streak_check', methods=['GET'])
@token_required
def streak_check(current_user):
    today = date.today()
    last = current_user.last_streak_date
    # Streak is broken if last_streak_date is None or more than 1 day ago
    broken = last is None or (today - last).days > 1
    return jsonify({'streak_broken': broken})

def update_streak(user):
    today = date.today()
    if user.last_streak_date == today:
        return  # Already updated today
    elif user.last_streak_date == today - timedelta(days=1):
        user.streak += 1
    else:
        user.streak = 1
    user.last_streak_date = today
