from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import hashlib
from bson.json_util import dumps
from bson.objectid import ObjectId
import uuid
from .utils import admin_required, user_from_request
from flask_swagger_ui import get_swaggerui_blueprint

load_dotenv()

client = MongoClient(os.getenv('MONGO_CONNECTION_STRING'))
db = client['user_forms']
users_collection = db['users']

user_blueprint = Blueprint('user', __name__)

### swagger specific ###
SWAGGER_URL = '/swagger'
API_URL = '/static/swagger.json'
SWAGGERUI_BLUEPRINT = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "Seans-Python-Flask-REST-Boilerplate"
    }
)
### end swagger specific ###

@user_blueprint.route('/admin', methods=['POST'])
def admin_register():
    new_user = request.get_json()
    new_user['password'] = hashlib.sha256(new_user['password'].encode('utf-8')).hexdigest()
    new_user['isAdmin'] = True
    users_collection.insert_one(new_user)
    return jsonify({'msg': 'Admin user created successfully'}), 201

@user_blueprint.route('/register', methods=['POST'])
def register():
    new_user = request.get_json()
    new_user['password'] = hashlib.sha256(new_user['password'].encode('utf-8')).hexdigest()
    new_user['isAdmin'] = False
    doc = users_collection.find_one({'username': new_user['username']})
    if not doc:
        users_collection.insert_one(new_user)
        return jsonify({'msg': 'User created successfully'}), 201
    else:
        return jsonify({'msg': 'Username already exists'}), 409

@user_blueprint.route('/getall', methods=['GET'])
def get_users():
    result = users_collection.find()
    data = [
        {'_id': str(doc['_id']),
         'username': doc['username'],
         'isAdmin': doc.get('isAdmin', False)}
        for doc in result
    ]
    return jsonify(data)

@user_blueprint.route("/login", methods=["POST"])
def login():
    login_details = request.get_json()
    user_from_db = users_collection.find_one({'username': login_details['username']})
    if user_from_db:
        encrpted_password = hashlib.sha256(login_details['password'].encode("utf-8")).hexdigest()
        if encrpted_password == user_from_db['password']:
            access_token = create_access_token(identity=user_from_db['username'])
            return jsonify(access_token=access_token, isAdmin=user_from_db['isAdmin'], username=user_from_db['username']), 200
    return jsonify({'msg': 'The username or password is incorrect'}), 401

@user_blueprint.route("/<username>", methods=["POST"])
def delete_user(username):
    user = users_collection.find_one({'username': username})
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    users_collection.delete_one({'username': username})
    return jsonify({'msg': 'User deleted successfully'}), 200
