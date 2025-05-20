import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', '18a65df782964b002cac39954cc92778fd20fad2948261273f9f841b867f2786')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'postgresql://aadityasah:postgrespass@localhost/skoupdb')
    SQLALCHEMY_TRACK_MODIFICATIONS = False