from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from .utils import ldap_authenticate, add_default_answers
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
            # Add default answers to questions without answers
            if user_data['ou'] == "User":
                add_default_answers(username)
            # Generate a JWT token
            access_token = create_access_token(identity=user_data)
            return jsonify({'message': 'Authentication successful', 'access_token': access_token, 'user_data': user_data})
        else:
            return jsonify({'message': 'Authentication failed'}), 401
    else:
        return jsonify({'message': 'Invalid request'}), 400