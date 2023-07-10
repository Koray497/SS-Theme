from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import hashlib
from bson.json_util import dumps
from bson.objectid import ObjectId
import uuid
from .utils import admin_required, user_from_request, ldap_authenticate
from flask_swagger_ui import get_swaggerui_blueprint
import base64
import re
from flask_jwt_extended import JWTManager
import ldap

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
        'app_name': "SS-Theme Api Test"
    }
)
### end swagger specific ###




@user_blueprint.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if username and password:
        user_data = ldap_authenticate(username, password)
        if user_data:
            # Generate a JWT token
            access_token = create_access_token(identity=user_data)
            return jsonify({'message': 'Authentication successful', 'access_token': access_token, 'user_data': user_data})
        else:
            return jsonify({'message': 'Authentication failed'})
    else:
        return jsonify({'message': 'Invalid request'}), 400

@user_blueprint.route('/protected_resource')
@jwt_required()
def protected_resource():
    # Retrieve user data from the JWT token
    user_data = get_jwt_identity()
    if user_data:
        return jsonify({'message': 'Access granted', 'user_data': user_data})
    else:
        return jsonify({'message': 'Access denied'})

