from pprint import pprint
from random import choice
import requests
import sys
import json
from cs50 import SQL

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

# this is session link list I will be checking against before sending doggos
linkList = []

# populating the link list with 50 random doggos
callPop = "https://dog.ceo/api/breeds/image/random/" + str("50")
responsePop = requests.get(callPop)
json_responsePop = responsePop.json()
linkList = json_responsePop['message']

# dictionary with dogs
doggos = {}
n = 10

# api call
call = "https://dog.ceo/api/breeds/image/random/" + str(n)
response = requests.get(call)
json_response = response.json()

i = 0

# checking whether the dog was already shown in this session
for l in linkList:
    for n, link in enumerate(json_response['message']):
        if l == link:
            print("yes, removing nth item", n)
            json_response['message'].pop(n)

# if not - add it to the link list
for link in json_response['message']:

    linkList.append(link)

    # and send it to the client
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

print(doggos)
