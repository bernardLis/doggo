import os
import re
import json
import requests
import sys

from pprint import pprint
from random import choice
from cs50 import SQL
from datetime import date, datetime, timedelta
from flask import Flask, flash, jsonify, redirect, render_template, request, session, request
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions, HTTPException, InternalServerError
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import apology

# Configure application
app = Flask(__name__)
application = app # our hosting requires application in passenger_wsgi

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Make session data persistent
# https://pythonise.com/series/learning-flask/flask-session-object
# TEMP secret key for sessions
app.config["SECRET_KEY"] = "APACHE"
app.config.from_object(__name__)

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_TYPE"] = "filesystem"

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///highscores.db")

Session(app)

@app.route("/", methods=["GET"])
def index():
    """Doggo App"""

    dogDict = loadDogs(15)
    return render_template("index.html", dogDict=dogDict)

@app.route("/hscoreEntry", methods=["POST"])
def hscoreEntry():
    # getting form info
    username = request.form.get("username")
    score = request.form.get("score")
    favbreed = "pekinczyk"

    # insering hscore of the user to the databse
    db.execute("INSERT INTO highscores (username, score, favbreed) VALUES (?, ?, ?)",
                (username, score, favbreed))

    return redirect("/highscores")

@app.route("/loadDogs", methods=["POST"])
def loadDogs(n):

    # dictionary with dogs
    doggos = {}

    # populating the dictionary
    for i in range(0, n):
        # api call
        response = requests.get("https://dog.ceo/api/breeds/image/random")
        json_response = response.json()

        # Formatting the breed name
        l = json_response["message"].split("/")
        breedStr = l[4].split("-")
        if len(breedStr) > 1:
            breed = breedStr[0].capitalize() + " " + breedStr[1].capitalize()
        else:
            breed = breedStr[0].capitalize()

        # Creating a list with a doggo img src and breed
        doggos[i] = []
        doggos[i].append(json_response["message"])
        doggos[i].append(breed)

    return doggos

@app.route("/loadDogsCall", methods=["POST"])
def loadDogsCall():
    dogs = loadDogs(10);
    print(dogs)
    
    return jsonify(dogs)

@app.route("/highscores", methods=["GET", "POST"])
def highscores():

    # getting highscores from the database
    hscores = db.execute("SELECT * FROM highscores ORDER BY score DESC")

    return render_template("highscores.html", hscores=hscores)

def errorhandler(e):
    """Handle error"""
    if not isinstance(e, HTTPException):
        e = InternalServerError()
    return apology(e.name, e.code)


# Listen for errors
for code in default_exceptions:
    app.errorhandler(code)(errorhandler)
