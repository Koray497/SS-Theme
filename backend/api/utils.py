from jwt import decode, InvalidTokenError, ExpiredSignatureError
from functools import wraps
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask import current_app
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from flask import jsonify, request
import ldap
import re
import base64


load_dotenv()

client = MongoClient(os.getenv('MONGO_CONNECTION_STRING'))
db = client['user_forms']
users_collection = db['users']

# LDAP configuration
LDAP_SERVER = 'ldap://192.168.1.66:389'
LDAP_BASE_DN = 'ou=People,dc=sstek,dc=com'
LDAP_BIND_DN = 'cn=admin,dc=sstek,dc=com'
LDAP_BIND_PASSWORD = '123'

def extract_ou_from_dn(dn):
    ou_match = re.search(r'cn=[^,]+,ou=([^,]+)', dn)
    if ou_match:
        return ou_match.group(1)
    return None

def ldap_authenticate(username, password):
    try:
        # Connect to the LDAP server
        ldap_connection = ldap.initialize(LDAP_SERVER)
        ldap_connection.simple_bind_s(LDAP_BIND_DN, LDAP_BIND_PASSWORD)
        print("LDAP connection successful")

        # Search for the user
        search_filter = f"(uid={username})"
        result = ldap_connection.search_s(LDAP_BASE_DN, ldap.SCOPE_SUBTREE, search_filter)

        if result:
            dn, attributes = result[0]

            # Authenticate the user
            ldap_connection.simple_bind_s(dn, password)
            print("User authentication successful")

            # Retrieve specific user data
            user_data = {
                'username': str(attributes.get('uid', [b''])[0], 'utf-8'),
                'email': str(attributes.get('mail', [b''])[0], 'utf-8'),
                'full_name': str(attributes.get('cn', [b''])[0], 'utf-8'),
                'ou': extract_ou_from_dn(dn)
                # Add more attributes as needed
            }

            # Convert bytes to base64-encoded strings
            for key, value in user_data.items():
                if isinstance(value, bytes):
                    user_data[key] = base64.b64encode(value).decode('utf-8')

            return user_data

        print("User not found in LDAP directory")
        return None
    except ldap.LDAPError as e:
        print(f"LDAP Error: {e}")
        return None

def user_from_request(request):
    token = request.headers.get('Authorization').split()[1]
    payload = decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
    user_data = payload['sub']
    return user_data

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'Authorization' in request.headers:
            try:
                user_data = user_from_request(request)
                if user_data and user_data['ou'] == 'Admin':
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