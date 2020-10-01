import os
import random
import re
import json
import requests
import sys
import redis

from pprint import pprint
from random import choice
from cs50 import SQL
from tempfile import mkdtemp

from datetime import date, datetime, timedelta
from flask import Flask, flash, jsonify, redirect, render_template, request, session, request, url_for
from flask_session import Session
from werkzeug.exceptions import default_exceptions, HTTPException, InternalServerError
from werkzeug.security import check_password_hash, generate_password_hash

from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import DataRequired
from flask_wtf.csrf import CSRFProtect
from flask_wtf.csrf import CSRFError

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
# TEMP secret key for sessions & csrf
app.config["SECRET_KEY"] = "APACHE"
app.config.from_object(__name__)

# Configure session to use redis (instead of signed cookies)
#app.config["SESSION_TYPE"] = "filesystem"
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_REDIS'] = redis.from_url('redis://localhost:6379')

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///doggoDB.db")

Session(app)

# flask-wtforms for csfr check
class MyForm(FlaskForm):
    name = StringField('name', validators=[DataRequired()])

#### displaying pages ####
@app.route("/test", methods=["GET"])
def test():
    return render_template("test.html")

@app.route("/", methods=["GET"])
def index():
    """Doggo App"""

    # clearing the session
    session.clear()
    # remember session even over browser restarts?
    session.permanent = False
    # create a shown doggos object in the session
    session['shownDogs'] = ["a dog"]

    dogs = loadDogs(2)
    readyDogs = prepareDogs(dogs)

    return render_template("index.html", dogs=readyDogs, ALL_BREEDS=ALL_BREEDS)

#### breed quiz ####
@app.route("/breedQuiz", methods=["GET"])
def breedQuiz():

    # check if the user came for shared link => has a shared dog in the session
    if "sharedDog" in session:
        readyDogs = session.get('sharedDog')
        form = MyForm()

        choices = []
        choices.append(session.get('choice1'))
        choices.append(session.get('choice2'))
        choices.append(session.get('choice3'))
        choices.append(session.get('choice4'))

        return render_template("breedQuiz.html", dogs=readyDogs, form=form, ALL_BREEDS=ALL_BREEDS, choices=choices)

    else:
        # clearing the session
        session.clear()
        # remember session even over browser restarts?
        session.permanent = False
        # create a shown doggos object in the session
        session['shownDogs'] = ["a dog"]

        dogs = loadDogs(1)
        readyDogs = prepareDogs(dogs)

        # to csrf validate the submit hscore form
        form = MyForm()

        return render_template("breedQuiz.html", dogs=readyDogs, ALL_BREEDS=ALL_BREEDS, form=form)

@app.route("/bq/s/<shareID>", methods=["GET"])
def sharedBreedQuiz(shareID):
    # clearing the session
    session.clear()
    # remember session even over browser restarts?
    session.permanent = False
    # create a shown doggos object in the session
    session['shownDogs'] = ["a dog"]

    # grab the shared dog from the db
    dbData = db.execute("SELECT * FROM breedQuizShares WHERE shareID=(?)", (shareID))

    # add it to shown dogs for the session
    session["shownDogs"].append(dbData[0]["link"])

    # prep the dog
    doggoList = {}
    doggoList[0] = []
    doggoList[0].append(dbData[0]["link"]);
    readyDogs = prepareDogs(doggoList)

    # add it to session so breed quiz route can grab it
    session["sharedDog"] = readyDogs
    session["choice1"] = dbData[0]["choice1"]
    session["choice2"] = dbData[0]["choice2"]
    session["choice3"] = dbData[0]["choice3"]
    session["choice4"] = dbData[0]["choice4"]

    return redirect(url_for('breedQuiz'))

@app.route("/bq/sm/<shareID>", methods=["GET"])
def sharedBQSummary(shareID):

    # clearing the session
    session.clear()
    # remember session even over browser restarts?
    session.permanent = False
    # create a shown doggos object in the session
    session['shownDogs'] = ["a dog"]

    # grab the shared dog from the db
    dbData = db.execute("SELECT link, direction FROM breedQuizSummaryShares WHERE summaryShareID=(?)", (shareID))
    score = db.execute("SELECT score FROM breedQuizSummarySharesScore WHERE summaryShareID=(?)", (shareID))

    # adding the dog breed and counting correct/incorrect doggos
    correctCount = 0
    incorrectCount = 0
    for dog in dbData:
        if dog['direction'] == 1:
            correctCount += 1
        else:
            incorrectCount += 1

        dog['breed'] = getBreedFromLink(dog['link'])

    print("correctCount", correctCount)
    print("incorrectCount", incorrectCount)
    return render_template("breedQuizSM.html", dbData=dbData, score=score, correctCount=correctCount, incorrectCount=incorrectCount)

#### hot dog ####
@app.route("/hotdog", methods=["GET"])
def hotdog():

    # check if the user came for shared link => has a shared dog in the session
    if "sharedDog" in session:
        readyDogs = session.get('sharedDog')
        vote = session.get('sharedDogVote')
        return render_template("hotdog.html", dogs=readyDogs, vote=vote)

    else:
        # clearing the session
        session.clear()
        # remember session even over browser restarts?
        session.permanent = False
        # create a shown doggos object in the session
        session['shownDogs'] = ["a dog"]

        dogs = loadDogs(1)
        readyDogs = prepareHotDogs(dogs)
        return render_template("hotdog.html", dogs=readyDogs)

@app.route("/hotdog/s/<shareID>", methods=["GET"])
def sharedHotDog(shareID):

    # clearing the session
    session.clear()
    # remember session even over browser restarts?
    session.permanent = False
    # create a shown doggos object in the session
    session['shownDogs'] = ["a dog"]

    # grab the shared dog from the db
    dbData = db.execute("SELECT link, vote FROM hotDogShares WHERE shareID=(?)", (shareID))

    # add it to shown dogs for the session
    session["shownDogs"].append(dbData[0]["link"])

    # prep the dog
    doggoList = {}
    doggoList[0] = []
    doggoList[0].append(dbData[0]["link"]);
    readyDogs = prepareHotDogs(doggoList)

    # add it to session so hotdog route can grab it
    session["sharedDog"] = readyDogs
    session["sharedDogVote"] = dbData[0]["vote"]

    return redirect(url_for('hotdog'))

@app.route("/hotdog/sm/<shareID>", methods=["GET"])
def sharedHotDogSummary(shareID):

    # clearing the session
    session.clear()
    # remember session even over browser restarts?
    session.permanent = False
    # create a shown doggos object in the session
    session['shownDogs'] = ["a dog"]

    # grab the shared dog from the db
    dbData = db.execute("SELECT link, vote FROM hotDogSummaryShares WHERE summaryShareID=(?)", (shareID))

    return render_template("hotdogSM.html", dbData=dbData)

@app.route("/highscores", methods=["GET", "POST"])
def highscores():

    # getting highscores from the database
    hscores = db.execute("SELECT * FROM highscores ORDER BY score DESC")

    return render_template("highscores.html", hscores=hscores)

@app.route("/info", methods=["GET"])
def info():

    return render_template("info.html")

#### creating hot profiles ####
@app.route("/hotprofile", methods=["POST"])
def hotprofile():
    # profiles
    profile = {
        'small': 0,
        'sumSmall': 0,
        'medium': 0,
        'sumMedium': 0,
        'big': 0,
        'sumBig': 0,
        'shortHair': 0,
        'sumShortHair': 0,
        'longHair': 0,
        'sumLongHair': 0
    }

    # data factory!
    data = request.get_json()

    hotDogs = data[0]
    for dog in hotDogs:
        # get the breed from the link
        breed = getBreedFromLink(dog)
        dbData = db.execute("SELECT size, hair FROM breedCharacteristics WHERE breed=(?)",
                            (breed))
        breedChars = dbData[0]

        # size profile
        if breedChars['size'] == 0:
            profile['small'] += 1
            profile['sumSmall'] += 1

        elif breedChars['size'] == 1:
            profile['medium'] += 1
            profile['sumMedium'] += 1

        else:
            profile['big'] += 1
            profile['sumBig'] += 1

        # hair profile
        if breedChars['hair'] == 0:
            profile['shortHair'] += 1
            profile['sumShortHair'] += 1

        else:
            profile['longHair'] += 1
            profile['sumLongHair'] += 1

    notDogs = data[1]
    for dog in notDogs:
        # get the breed from the link
        breed = getBreedFromLink(dog)
        dbData = db.execute("SELECT size, hair FROM breedCharacteristics WHERE breed=(?)",
                            (breed))
        breedChars = dbData[0]

        # size profile
        if breedChars['size'] == 0:
            profile['small'] -= 1
            profile['sumSmall'] += 1
        elif breedChars['size'] == 1:
            profile['medium'] -= 1
            profile['sumMedium'] += 1
        else:
            profile['big'] -= 1
            profile['sumBig'] += 1

        # hair profile
        if breedChars['hair'] == 0:
            profile['shortHair'] -= 1
            profile['sumShortHair'] += 1

        else:
            profile['longHair'] -= 1
            profile['sumLongHair'] += 1

    return jsonify(profile, 204)

#### loading dogs ####
@app.route("/loadDogs", methods=["POST"])
def loadDogs(n):

    # making sure shownDogs exists in the session
    if not 'shownDogs' in session:
        session["shownDogs"] = ["aDOGGO"]

    # clearing session when shown dogs list is over 20k dogs
    if len(session["shownDogs"]) > 20000:
        session.clear()

    # api call
    call = "https://api.doggo.fans/randomDog/" + str(n)
    response = requests.get(call)
    dogsFromApi = response.json()

    # checking whether the dog was already shown in this session
    dogsFromApiChecked = set(dogsFromApi) - set(session["shownDogs"])

    # start over if too many doggos were deleted
    if len(dogsFromApiChecked) < n/2:
        loadDogs(n)

    # dictionary with dogs
    doggos = {}

    i = 0
    for link in dogsFromApiChecked:
        # adding the link to shown dogs
        session["shownDogs"].append(link)

        # Creating a list with a doggo img src
        doggos[i] = []
        doggos[i].append(link)
        i += 1

    return doggos

@app.route("/loadHotDogs", methods=["POST"])
def loadHotDogs():
    # loading dogs
    dogs = loadDogs(10)
    readyDogs = prepareHotDogs(dogs)

    return jsonify(readyDogs)

@app.route("/loadDogsCall", methods=["POST"])
def loadDogsCall():
    dogs = loadDogs(10)
    readyDogs = prepareDogs(dogs)

    return jsonify(readyDogs)

#### data collection ####
@app.route("/collectBreedQuizData", methods=["POST"])
def collectBreedQuizData():
    data = request.get_json()

    db.execute("INSERT INTO guesses (link, choice1, choice2, choice3, choice4, userGuess) VALUES (?, ?, ?, ?, ?, ?)",
                    (data["link"], data["choice1"], data["choice2"], data["choice3"], data["choice4"], data["userGuess"]))

    return jsonify("", 204)

@app.route("/collectBreedQuizShareData", methods=["POST"])
def collectBreedQuizShareData():
    data = request.get_json()

    db.execute("INSERT INTO breedQuizShares (shareID, link, choice1, choice2, choice3, choice4) VALUES (?, ?, ?, ?, ?, ?)",
                    (data["id"], data["link"], data["choice1"], data["choice2"], data["choice3"], data["choice4"]))

    return jsonify("", 204)

@app.route("/collectBreedQuizSummaryShareData", methods=["POST"])
def collectBreedQuizSummaryShareData():
    data = request.get_json()

    for entry in data:
        db.execute("INSERT INTO breedQuizSummaryShares (summaryShareID, link, direction) VALUES (?, ?, ?)",
        (entry["id"], entry["link"], entry["direction"]))

    return jsonify("", 204)

@app.route("/collectBreedQuizSummaryShareScoreData", methods=["POST"])
def collectBreedQuizSummaryShareScoreData():
    data = request.get_json()

    db.execute("INSERT INTO breedQuizSummarySharesScore (summaryShareID, score) VALUES (?, ?)",
                    (data["id"], data["score"]))

    return jsonify("", 204)

@app.route("/collectHotDogData", methods=["POST"])
def collectHotDogData():
    data = request.get_json()

    db.execute("INSERT INTO hotdog (link, answer) VALUES (?, ?)",
                    (data["link"], data["answer"]))

    return jsonify("", 204)

@app.route("/collectHotDogShareData", methods=["POST"])
def collectHotDogShareData():
    data = request.get_json()

    db.execute("INSERT INTO hotDogShares (shareID, link, vote) VALUES (?, ?, ?)",
                    (data["id"], data["link"], data["vote"]))

    return jsonify("", 204)

@app.route("/collectHotDogSummaryShareData", methods=["POST"])
def collectHotDogSummaryShareData():
    data = request.get_json()

    for entry in data:
        db.execute("INSERT INTO hotDogSummaryShares (summaryShareID, link, vote) VALUES (?, ?, ?)",
        (entry["id"], entry["link"], entry["vote"]))

    return jsonify("", 204)

#### highscores ####
@app.route("/hscoreEntry", methods=["POST"])
def hscoreEntry():
    # getting form info
    username = request.form.get("username")
    score = request.form.get("score")
    favbreed = request.form.get("favBreed")

    # naive score validation
    if int(score) > 4500:
        return jsonify("You won!")

    # insering hscore of the user to the databse
    db.execute("INSERT INTO highscores (username, score, favbreed) VALUES (?, ?, ?)",
                (username, score, favbreed))

    return jsonify("Success!")

@app.route("/hsadmin", methods=["GET", "POST"])
def hsadmin():

    # getting highscores from the database
    hscores = db.execute("SELECT * FROM highscores ORDER BY score DESC")

    return render_template("hsAdmin.html", hscores=hscores)

@app.route("/deleteHSEntry", methods=["POST"])
def deleteHSEntry():
    userid = request.form.get("userid")
    db.execute("DELETE FROM highscores WHERE userid=(?)", (userid))
    hscores = db.execute("SELECT * FROM highscores ORDER BY score DESC")

    return render_template("hsAdmin.html", hscores=hscores)

#### errors ####
def errorhandler(e):
    """Handle error"""
    if not isinstance(e, HTTPException):
        e = InternalServerError()
    return apology(e.name, e.code)

# Listen for errors
for code in default_exceptions:
    app.errorhandler(code)(errorhandler)

#### helpers ####

def getBreedFromLink(link):
    # preping dogDict and sending it to the client
    dogLink = link.split("/")
    breedStr = re.split(r'[-_]', dogLink[4])
    breed = ""
    for i, str in enumerate(breedStr):
        if i == (len(breedStr) - 1):
            breed = breed + breedStr[i].capitalize()
        elif i != 0:
            breed = breed + breedStr[i].capitalize() + " "

    return breed

def prepareDogs(dogs):
    for key in dogs:
        # preping dogDict and sending it to the client
        breed = getBreedFromLink(dogs[key][0])

        # Encrypt doggo breed
        encryptedBreed = caesarShift(breed, 4)

        # Creating a list with a doggo img src and breed
        dogs[key].append(encryptedBreed)

    return dogs

def prepareHotDogs(dogs):
    for key in dogs:
        dogLink = dogs[key][0]
        totalVotes = db.execute("SELECT COUNT(link) FROM hotdog WHERE link=(?)", (dogs[key][0]))
        hotVotes = db.execute("SELECT SUM(answer) FROM hotdog WHERE link=(?)", (dogs[key][0]))
        dogs[key].append(totalVotes[0]['COUNT(link)'])
        dogs[key].append(hotVotes[0]['SUM(answer)'])

    return dogs


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

@app.errorhandler(CSRFError)
def handle_csrf_error(e):
    return jsonify(e.description)

ALL_BREEDS = ['Chihuahua', 'Japanese Spaniel', 'Maltese Dog', 'Pekinese', 'Shih Tzu', 'Blenheim Spaniel', 'Papillon', 'Toy Terrier', 'Rhodesian Ridgeback', 'Afghan Hound', 'Basset', 'Beagle', 'Bloodhound',  'Bluetick', 'Black And Tan Coonhound', 'Walker Hound', 'English Foxhound', 'Redbone', 'Borzoi', 'Irish Wolfhound', 'Italian Greyhound', 'Whippet', 'Ibizan Hound', 'Norwegian Elkhound', 'Otterhound', 'Saluki', 'Scottish Deerhound', 'Weimaraner', 'Staffordshire Bullterrier', 'American Staffordshire Terrier', 'Bedlington Terrier', 'Border Terrier', 'Kerry Blue Terrier', 'Irish Terrier', 'Norfolk Terrier', 'Norwich Terrier', 'Yorkshire Terrier', 'Wire Haired Fox Terrier', 'Lakeland Terrier', 'Sealyham Terrier', 'Airedale', 'Cairn', 'Australian Terrier', 'Dandie Dinmont', 'Boston Bull', 'Miniature Schnauzer', 'Giant Schnauzer', 'Standard Schnauzer', 'Scotch Terrier', 'Tibetan Terrier', 'Silky Terrier', 'Soft Coated Wheaten Terrier', 'West Highland White Terrier', 'Lhasa', 'Flat Coated Retriever', 'Curly Coated Retriever', 'Golden Retriever', 'Labrador Retriever', 'Chesapeake Bay Retriever', 'German Short Haired Pointer', 'Vizsla', 'English Setter', 'Irish Setter', 'Gordon Setter', 'Brittany Spaniel', 'Clumber', 'English Springer', 'Welsh Springer Spaniel', 'Cocker Spaniel', 'Sussex Spaniel', 'Irish Water Spaniel', 'Kuvasz', 'Schipperke', 'Groenendael', 'Malinois', 'Briard', 'Kelpie', 'Komondor', 'Old English Sheepdog', 'Shetland Sheepdog', 'Collie', 'Border Collie', 'Bouvier Des Flandres', 'Rottweiler', 'German Shepherd', 'Doberman', 'Miniature Pinscher', 'Greater Swiss Mountain Dog', 'Bernese Mountain Dog', 'Appenzeller', 'Entlebucher', 'Boxer', 'Bull Mastiff', 'Tibetan Mastiff', 'French Bulldog', 'Great Dane', 'Saint Bernard', 'Eskimo Dog', 'Malamute', 'Siberian Husky', 'Affenpinscher', 'Basenji', 'Pug', 'Leonberg', 'Newfoundland', 'Great Pyrenees', 'Samoyed', 'Pomeranian', 'Chow', 'Keeshond', 'Brabancon Griffon', 'Pembroke', 'Cardigan', 'Toy Poodle', 'Miniature Poodle', 'Standard Poodle', 'Mexican Hairless', 'Dingo', 'Dhole', 'African Hunting Dog']
