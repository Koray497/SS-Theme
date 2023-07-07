import base64
import re
from flask import Blueprint, request, jsonify, session
import ldap

user_blueprint = Blueprint('user', __name__)

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

@user_blueprint.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if username and password:
        user_data = ldap_authenticate(username, password)
        if user_data:
            # Store user data in the session
            session['user_data'] = user_data
            return jsonify({'message': 'Authentication successful', 'user_data': user_data})
        else:
            return jsonify({'message': 'Authentication failed'})
    else:
        return jsonify({'message': 'Invalid request'}), 400

@user_blueprint.route('/protected_resource')
def protected_resource():
    # Retrieve user data from the session
    user_data = session.get('user_data')
    if user_data:
        return jsonify({'message': 'Access granted', 'user_data': user_data})
    else:
        return jsonify({'message': 'Access denied'})
