from pymongo import MongoClient
from dotenv import load_dotenv
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
import datetime
import hashlib
from functools import wraps
from jwt import decode, InvalidTokenError, ExpiredSignatureError
from bson.json_util import dumps
from bson.objectid import ObjectId
import uuid

load_dotenv()

app = Flask(__name__)
CORS(app)
jwt = JWTManager(app)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)

client = MongoClient(os.getenv('MONGO_CONNECTION_STRING'))
db = client['user_forms']
users_collection = db['users']
forms_collection = db['forms']

def user_from_request(request):
    token = request.headers.get('Authorization').split()[1]
    payload = decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
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

@app.route('/api/users/admin', methods=['POST'])
def admin_register():
    new_user = request.get_json()
    new_user['password'] = hashlib.sha256(new_user['password'].encode('utf-8')).hexdigest()
    new_user['isAdmin'] = True
    users_collection.insert_one(new_user)
    return jsonify({'msg': 'Admin user created successfully'}), 201

@app.route('/api/users', methods=['POST'])
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
#remove
@app.route('/api/users', methods=['GET'])
def get_users():
    result = users_collection.find()
    data = [
        {'_id': str(doc['_id']),
         'username': doc['username'],
         'isAdmin': doc.get('isAdmin', False)}
        for doc in result
    ]
    return jsonify(data)
#remove
@app.route("/api/login", methods=["POST"])
def login():
    login_details = request.get_json()
    user_from_db = users_collection.find_one({'username': login_details['username']})
    if user_from_db:
        encrpted_password = hashlib.sha256(login_details['password'].encode("utf-8")).hexdigest()
        if encrpted_password == user_from_db['password']:
            access_token = create_access_token(identity=user_from_db['username'])
            return jsonify(access_token=access_token, isAdmin=user_from_db['isAdmin'], username=user_from_db['username']), 200
    return jsonify({'msg': 'The username or password is incorrect'}), 401
#remove
@app.route("/api/users/<username>", methods=["DELETE"])
def delete_user(username):
    user = users_collection.find_one({'username': username})
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    users_collection.delete_one({'username': username})
    texts_collection.delete_many({'profile': username})
    return jsonify({'msg': 'User deleted successfully'}), 200

@app.route('/api/forms', methods=['POST'])
@admin_required
def create_form():
    form_data = request.get_json()
    form = forms_collection.find_one({'formName': form_data['formName']})
    if form:
        return jsonify({'msg': 'Form with name already exists'}), 404
    else:
        form_id = str(uuid.uuid4())
        form_data['id'] = form_id
        forms_collection.insert_one(form_data)
        return jsonify({'msg': 'Form creation successful'}), 201

@app.route('/api/forms', methods=['GET'])
def get_all_forms():
    forms = forms_collection.find()
    if forms:
        forms_data = dumps(forms)
        return forms_data, 200, {'Content-Type': 'application/json'}
    return jsonify({'msg': 'No forms found'}), 404

@app.route('/api/forms/<form_id>', methods=['PUT'])
@admin_required
def update_form(form_id):
    updated_data = request.get_json()
    forms_collection.update_one({'id': form_id}, {'$set': updated_data})
    return jsonify({'msg': 'Form updated successfully'})

@app.route('/api/forms/<form_id>', methods=['DELETE'])
@admin_required
def delete_form(form_id):
    forms_collection.delete_one({'id': form_id})
    return jsonify({'msg': 'Form deleted successfully'})

@app.route('/api/forms/<form_id>/responses', methods=['POST'])
@jwt_required()
def add_response(form_id):
    response_data = request.get_json()
    user = user_from_request(request)
    updated = False
    for answer_data in response_data:
        question_id = answer_data['questionId']
        answer = answer_data.get('answer', None)
        answer_data = {
            'id': str(uuid.uuid4()),
            'userId': user['_id'],
            'username': user['username'],
            'answer': answer
        }

        existing_answer = forms_collection.find_one(
            {
                'id': form_id,
                'formQuestions': {
                    '$elemMatch': {
                        'id': question_id,
                        'answers': {
                            '$elemMatch': {
                                'userId': user['_id']
                            }
                        }
                    }
                }
            },
            {'formQuestions.$': 1}
        )

        if existing_answer:
            updated = True
            forms_collection.update_one(
                {'id': form_id, 'formQuestions.id': question_id, 'formQuestions.answers.userId': user['_id']},
                {'$set': {'formQuestions.$.answers.$[elem].answer': answer}},
                array_filters=[{'elem.userId': user['_id']}]
            )
        else:
            forms_collection.update_one(
                {'id': form_id, 'formQuestions.id': question_id},
                {'$push': {'formQuestions.$.answers': answer_data}}
            )
    if not updated:
        return jsonify({'msg': 'Response added successfully'})
    else:
        return jsonify({'msg': 'Response updated successfully'})

app.debug = True

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
