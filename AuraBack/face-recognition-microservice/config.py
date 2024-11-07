# config.py
import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'mysecretkey')
