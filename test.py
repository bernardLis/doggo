from pprint import pprint
from random import choice
import requests
import sys
import json
from cs50 import SQL

db = SQL("sqlite:///highscores.db")
hscores = db.execute("SELECT * FROM highscores ORDER BY score DESC")
print(hscores)
print(type(hscores))

for score in hscores:
    print(score)
    print(score["user"])
    print(score["score"])
