import os
import re
import json
import requests
import sys
import redis

from pprint import pprint
from random import choice
from cs50 import SQL
from datetime import date, datetime, timedelta
from flask import Flask, flash, jsonify, redirect, render_template, request, session, request, url_for
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

# Configure session to use redis (instead of signed cookies)
#app.config["SESSION_TYPE"] = "filesystem"
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_REDIS'] = redis.from_url('redis://localhost:6379')

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///doggoDB.db")

Session(app)

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

@app.route("/breedQuiz", methods=["GET"])
def breedQuiz():

        # clearing the session
        session.clear()
        # remember session even over browser restarts?
        session.permanent = False
        # create a shown doggos object in the session
        session['shownDogs'] = ["a dog"]

        dogs = loadDogs(1)
        readyDogs = prepareDogs(dogs)

        return render_template("breedQuiz.html", dogs=readyDogs, ALL_BREEDS=ALL_BREEDS)



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
    call = "https://dog.ceo/api/breeds/image/random/" + str(n)
    response = requests.get(call)
    json_response = response.json()
    dogsFromApi = json_response['message']

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

@app.route("/collectData", methods=["POST"])
def collectData():
    data = request.get_json()

    db.execute("INSERT INTO guesses (link, choice1, choice2, choice3, choice4, userGuess) VALUES (?, ?, ?, ?, ?, ?)",
                    (data["link"], data["choice1"], data["choice2"], data["choice3"], data["choice4"], data["userGuess"]))

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

def prepareDogs(dogs):
    for key in dogs:
        # preping dogDict and sending it to the client
        dogLink = dogs[key][0].split("/")
        breedStr = dogLink[4].split("-")
        if len(breedStr) > 1:
            breed = breedStr[0].capitalize() + " " + breedStr[1].capitalize()
        else:
            breed = breedStr[0].capitalize()

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