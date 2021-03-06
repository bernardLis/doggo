from pprint import pprint
from random import choice
import requests
import sys
import json
from cs50 import SQL
import os
import random
import re
from cs50 import SQL

db = SQL("sqlite:///doggoDB.db")

def calculateHotAverages():
    avgProfile = {
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
    hotData = db.execute("SELECT link FROM hotdog WHERE answer=1")
    notData = db.execute("SELECT link FROM hotdog WHERE answer=0")
    for dog in hotData:
        # get the breed from the link
        breed = getBreedFromLink(dog['link'])
        dbData = db.execute("SELECT size, hair FROM breedCharacteristics WHERE breed=(?)",
                            (breed))
        breedChars = dbData[0]

        # size profile
        if breedChars['size'] == 0:
            avgProfile['small'] += 1
            avgProfile['sumSmall'] += 1

        elif breedChars['size'] == 1:
            avgProfile['medium'] += 1
            avgProfile['sumMedium'] += 1

        else:
            avgProfile['big'] += 1
            avgProfile['sumBig'] += 1

        # hair profile
        if breedChars['hair'] == 0:
            avgProfile['shortHair'] += 1
            avgProfile['sumShortHair'] += 1

        else:
            avgProfile['longHair'] += 1
            avgProfile['sumLongHair'] += 1

    for dog in notData:
        # get the breed from the link
        breed = getBreedFromLink(dog['link'])
        dbData = db.execute("SELECT size, hair FROM breedCharacteristics WHERE breed=(?)",
                            (breed))
        breedChars = dbData[0]

        # size profile
        if breedChars['size'] == 0:
            avgProfile['small'] -= 1
            avgProfile['sumSmall'] += 1
        elif breedChars['size'] == 1:
            avgProfile['medium'] -= 1
            avgProfile['sumMedium'] += 1
        else:
            avgProfile['big'] -= 1
            avgProfile['sumBig'] += 1

        # hair profile
        if breedChars['hair'] == 0:
            avgProfile['shortHair'] -= 1
            avgProfile['sumShortHair'] += 1

        else:
            avgProfile['longHair'] -= 1
            avgProfile['sumLongHair'] += 1

    avg = {
        'avgSmall': avgProfile['small']/avgProfile['sumSmall'],
        'avgMedium': avgProfile['medium']/avgProfile['sumMedium'],
        'avgBig': avgProfile['big']/avgProfile['sumBig'],
        'avgShortHair': avgProfile['shortHair']/avgProfile['sumShortHair'],
        'avgLongHair': avgProfile['longHair']/avgProfile['sumLongHair']
    }
    return avg

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



calculateHotAverages()
