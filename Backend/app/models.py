from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.ext.mutable import MutableList

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    avatar_path = db.Column(db.String(256), nullable=True)
    trash_collected = db.Column(db.Integer, default=0, nullable=False)
    coin = db.Column(db.Integer, default=0, nullable=False)
    unlocked_items = db.Column(MutableList.as_mutable(db.ARRAY(db.String)), default=list)
    equipped_items = db.Column(MutableList.as_mutable(db.ARRAY(db.String)), default=list)
    streak = db.Column(db.Integer, default=0, nullable=False)
    last_streak_date = db.Column(db.Date, nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)