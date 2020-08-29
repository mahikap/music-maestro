from flask import Flask, render_template, url_for, request, render_template, jsonify, redirect
import json
from flask_cors import CORS, cross_origin


app = Flask(__name__)

# API
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/vocal_range')
def vocal_range():
    return render_template('vocal_range.html')

@app.route('/vocal_range_lowest')
def vocal_range_lowest():
    return render_template('vocal_range_lowest.html')

@app.route('/vocal_range_highest')
def vocal_range_highest():
    return render_template('vocal_range_highest.html')

@app.route('/vocal_range_results')
def vocal_range_results():
    return render_template('vocal_range_results.html')

@app.route('/lessons')
def lessons():
    return render_template('lessons.html')

@app.route('/lessons/lesson_beginner_1')
def lesson_1():
    return render_template('lesson_1.html')

@app.route('/lessons/test_1')
def test_1():
    return render_template('test_1.html')


if __name__ == "__main__":
    app.run(debug=True)