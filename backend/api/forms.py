from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from bson.json_util import dumps
from bson.objectid import ObjectId
import uuid
from .utils import admin_required, user_from_request

load_dotenv()

client = MongoClient(os.getenv('MONGO_CONNECTION_STRING'))
db = client['user_forms']
forms_collection = db['forms']

forms_blueprint = Blueprint('forms', __name__)

@forms_blueprint.route('/create', methods=['POST'])
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

@forms_blueprint.route('/getall', methods=['GET'])
def get_all_forms():
    forms = forms_collection.find()
    if forms:
        forms_data = dumps(forms)
        return forms_data, 200, {'Content-Type': 'application/json'}
    return jsonify({'msg': 'No forms found'}), 404

@forms_blueprint.route('/<form_id>', methods=['POST'])
@admin_required
def update_form(form_id):
    updated_data = request.get_json()
    forms_collection.update_one({'id': form_id}, {'$set': updated_data})
    return jsonify({'msg': 'Form updated successfully'})

@forms_blueprint.route('/delete/<form_id>', methods=['POST'])
@admin_required
def delete_form(form_id):
    forms_collection.delete_one({'id': form_id})
    return jsonify({'msg': 'Form deleted successfully'})

@forms_blueprint.route('/<form_id>/responses', methods=['POST'])
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
