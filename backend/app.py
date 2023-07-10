from flask import Flask, current_app
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from pymongo import MongoClient
import datetime
from api.user import user_blueprint, SWAGGERUI_BLUEPRINT, SWAGGER_URL  
from api.forms import forms_blueprint

load_dotenv()

app = Flask(__name__)
app.secret_key = 'your_secret_key'
CORS(app)
jwt = JWTManager(app)
jwt.init_app(app)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)

client = MongoClient(os.getenv('MONGO_CONNECTION_STRING'))
db = client['user_forms']

app.register_blueprint(user_blueprint, url_prefix='/api/users')
app.register_blueprint(forms_blueprint, url_prefix='/api/forms')
app.register_blueprint(SWAGGERUI_BLUEPRINT, url_prefix=SWAGGER_URL)

@app.route('/static/<path:path>')
def send_static(path):
    return current_app.send_static_file(path)

app.debug = True

if __name__ == '__main__':
    # Set the JWT secret key
    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")
    app.run(host='0.0.0.0', port=5000)
