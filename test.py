from pprint import pprint
from random import choice
import requests
import sys
import json
from cs50 import SQL

# dictionary with dogs
doggos = {}

n = 3
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

    # Creating a list with a doggo img src and breed
    doggos[i] = []
    doggos[i].append(link)
    doggos[i].append(breed)
    i += 1

print(doggos)
