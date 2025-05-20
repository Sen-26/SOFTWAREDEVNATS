from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    db.init_app(app)
    CORS(app)

    from app.detection.routes import detection_bp
    from app.auth.routes import auth_bp
    from app.users.routes import users_bp
    # from app.heatmap.routes import heatmap_bp

    app.register_blueprint(detection_bp, url_prefix='/detection')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(users_bp, url_prefix='/users')
    # app.register_blueprint(heatmap_bp, url_prefix='/heatmap')

    return app