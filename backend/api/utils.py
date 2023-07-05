from jwt import decode, InvalidTokenError, ExpiredSignatureError
from functools import wraps
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask import current_app
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from flask import jsonify, request


load_dotenv()

client = MongoClient(os.getenv('MONGO_CONNECTION_STRING'))
db = client['user_forms']
users_collection = db['users']

def user_from_request(request):
    token = request.headers.get('Authorization').split()[1]
    payload = decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
    username = payload['sub']
    user_from_db = users_collection.find_one({'username': username})
    return user_from_db

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'Authorization' in request.headers:
            try:
                user_from_db = user_from_request(request)
                if user_from_db and user_from_db['isAdmin']:
                    return f(*args, **kwargs)
                else:
                    return jsonify(message='Admin access required'), 403
            except ExpiredSignatureError:
                return jsonify(message='Token has expired'), 401
            except InvalidTokenError:
                return jsonify(message='Invalid token'), 401
        else:
            return jsonify(message='Missing authorization token'), 401

    return decorated_function