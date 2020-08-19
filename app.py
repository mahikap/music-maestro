from flask import Flask, render_template, url_for, request, render_template, jsonify, redirect
import json
from flask_cors import CORS, cross_origin


app = Flask(__name__)

# API
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/lessons')
def lessons():
    return render_template('lessons.html')


if __name__ == "__main__":
    app.run(debug=True)