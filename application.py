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

from flask_wtf.csrf import CSRFProtect

from helpers import apology

# Configure application
app = Flask(__name__)
application = app # our hosting requires application in passenger_wsgi

# https://flask-wtf.readthedocs.io/en/stable/csrf.html?fbclid=IwAR25LkK-Hw3ii8UuL-tD-GVVVYcve8XqMNV8VM1TB0Gh-JxQcBVcpSmH2BU
csrf = CSRFProtect()

def create_app():
    app = Flask(__name__)
    csrf.init_app(app)

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
    return render_template("index.html", dogDict=dogDict, ALL_BREEDS=ALL_BREEDS)

@app.route("/hscoreEntry", methods=["POST"])
def hscoreEntry():
    # getting form info
    username = request.form.get("username")
    score = request.form.get("score")
    favbreed = request.form.get("favBreed")

    # naive score validation
    if int(score) > 3500:
        return jsonify("You won!")

    # insering hscore of the user to the databse
    db.execute("INSERT INTO highscores (username, score, favbreed) VALUES (?, ?, ?)",
                (username, score, favbreed))

    return jsonify("Success!")

@app.route("/loadDogs", methods=["POST"])
def loadDogs(n):

    # dictionary with dogs
    doggos = {}

    # api call
    call = "https://dog.ceo/api/breeds/image/random/" + str(n)
    response = requests.get(call)
    json_response = response.json()

    i = 0
    for link in json_response['message']:
        l = link.split("/")
        breedStr = l[4].split("-")
        if len(breedStr) > 1:
            breed = breedStr[0].capitalize() + " " + breedStr[1].capitalize()
        else:
            breed = breedStr[0].capitalize()

        # Encrypt doggo breed
        encryptedBreed = caesarShift(breed, 4)

        # Creating a list with a doggo img src and breed
        doggos[i] = []
        doggos[i].append(link)
        doggos[i].append(encryptedBreed)
        i += 1

    return doggos

@app.route("/loadDogsCall", methods=["POST"])
def loadDogsCall():
    dogs = loadDogs(10);
    return jsonify(dogs)

@app.route("/highscores", methods=["GET", "POST"])
def highscores():

    # getting highscores from the database
    hscores = db.execute("SELECT * FROM highscores ORDER BY score DESC")

    return render_template("highscores.html", hscores=hscores)

@app.route("/info", methods=["GET"])
def info():

    return render_template("info.html")

def errorhandler(e):
    """Handle error"""
    if not isinstance(e, HTTPException):
        e = InternalServerError()
    return apology(e.name, e.code)


# Listen for errors
for code in default_exceptions:
    app.errorhandler(code)(errorhandler)


def caesarShift(string, key):
    k = key
    plainString = string
    cipherString = ""

    for char in plainString:
        if 65 <= ord(char) <= 90:
            cipherASCII = 65 + ((ord(char) - 65 + key) % 26)
            cipherString = cipherString + chr(cipherASCII)

        elif 97 <= ord(char) <= 122:
            cipherASCII = 97 + ((ord(char) - 97 + key) % 26)
            cipherString = cipherString + chr(cipherASCII)

        else:
            cipherString = cipherString + char

    return cipherString



ALL_BREEDS = ['Affenpinscher', 'African', 'Airedale', 'Akita', 'Appenzeller', 'Australian Shepherd', 'Basenji', 'Beagle', 'Bluetick', 'Borzoi', 'Bouvier', 'Boxer', 'Brabancon', 'Briard',
'Buhund Norwegian', 'Bulldog Boston', 'Bulldog English', 'Bulldog French', 'Bullterrier Staffordshire', 'Cairn', 'Cattledog Australian', 'Chihuahua', 'Chow', 'Clumber',
'Cockapoo', 'Collie Border', 'Coonhound', 'Corgi Cardigan', 'Cotondetulear', 'Dachshund', 'Dalmatian', 'Dane Great', 'Deerhound Scottish', 'Dhole', 'Dingo', 'Doberman',
'Elkhound Norwegian', 'Entlebucher', 'Eskimo', 'Finnish Lapphund', 'Frise Bichon', 'Germanshepherd', 'Greyhound Italian', 'Groenendael', 'Havanese', 'Hound Afghan',
'Hound Basset', 'Hound Blood', 'Hound English', 'Hound Ibizan', 'Hound Plott', 'Hound Walker', 'Husky', 'Keeshond', 'Kelpie', 'Komondor', 'Kuvasz', 'Labrador', 'Leonberg',
'Lhasa', 'Malamute', 'Malinois', 'Maltese', 'Mastiff Bull', 'Mastiff English', 'Mastiff Tibetan', 'Mexicanhairless', 'Mix', 'Mountain Bernese', 'Mountain Swiss', 'Newfoundland',
'Otterhound', 'Ovcharka Caucasian', 'Papillon', 'Pekinese', 'Pembroke', 'Pinscher Miniature', 'Pitbull', 'Pointer German', 'Pointer Germanlonghair', 'Pomeranian',
'Poodle Miniature', 'Poodle Standard', 'Poodle Toy', 'Pug', 'Puggle', 'Pyrenees', 'Redbone', 'Retriever Chesapeake', 'Retriever Curly', 'Retriever Flatcoated',
'Retriever Golden', 'Ridgeback Rhodesian', 'Rottweiler', 'Saluki', 'Samoyed', 'Schipperke', 'Schnauzer Giant', 'Schnauzer Miniature', 'Setter English', 'Setter Gordon',
'Setter Irish', 'Sheepdog English', 'Sheepdog Shetland', 'Shiba', 'Shihtzu', 'Spaniel Blenheim', 'Spaniel Brittany', 'Spaniel Cocker', 'Spaniel Irish', 'Spaniel Japanese',
'Spaniel Sussex', 'Spaniel Welsh', 'Springer English', 'Stbernard', 'Terrier American', 'Terrier Australian', 'Terrier Bedlington', 'Terrier Border', 'Terrier Dandie',
'Terrier Fox', 'Terrier Irish', 'Terrier Kerryblue', 'Terrier Lakeland', 'Terrier Norfolk', 'Terrier Norwich', 'Terrier Patterdale', 'Terrier Russell', 'Terrier Scottish',
'Terrier Sealyham', 'Terrier Silky', 'Terrier Tibetan', 'Terrier Toy', 'Terrier Westhighland', 'Terrier Wheaten', 'Terrier Yorkshire', 'Vizsla', 'Waterdog Spanish', 'Weimaraner',
'Whippet', 'Wolfhound Irish']