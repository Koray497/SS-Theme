from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from pymongo import MongoClient
import datetime

from api.user import user_blueprint
from api.themes import themes_blueprint

load_dotenv()

app = Flask(__name__)
app.secret_key = 'your_secret_key'
CORS(app)
jwt = JWTManager(app)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)

client = MongoClient(os.getenv('MONGO_CONNECTION_STRING'))
db = client['user_forms']

app.register_blueprint(user_blueprint, url_prefix='/api/users')
app.register_blueprint(themes_blueprint, url_prefix='/api/forms')

app.debug = True

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
