from pprint import pprint
from random import choice
import requests
import sys
import json
from cs50 import SQL
import os
import random
import re

path = "D:\projects\doggo\dogs"

ALL_BREEDS = ['Chihuahua', 'Japanese Spaniel', 'Maltese Dog', 'Pekinese', 'Shih Tzu', 'Blenheim Spaniel', 'Papillon', 'Toy Terrier', 'Rhodesian Ridgeback', 'Afghan Hound', 'Basset', 'Beagle', 'Bloodhound',  'Bluetick', 'Black And Tan Coonhound', 'Walker Hound', 'English Foxhound', 'Redbone', 'Borzoi', 'Irish Wolfhound', 'Italian Greyhound', 'Whippet', 'Ibizan Hound', 'Norwegian Elkhound', 'Otterhound', 'Saluki', 'Scottish Deerhound', 'Weimaraner', 'Staffordshire Bullterrier', 'American Staffordshire Terrier', 'Bedlington Terrier', 'Border Terrier', 'Kerry Blue Terrier', 'Irish Terrier', 'Norfolk Terrier', 'Norwich Terrier', 'Yorkshire Terrier', 'Wire Haired Fox Terrier', 'Lakeland Terrier', 'Sealyham Terrier', 'Airedale', 'Cairn', 'Australian Terrier', 'Dandie Dinmont', 'Boston Bull', 'Miniature Schnauzer', 'Giant Schnauzer', 'Standard Schnauzer', 'Scotch Terrier', 'Tibetan Terrier', 'Silky Terrier', 'Soft Coated Wheaten Terrier', 'West Highland White Terrier', 'Lhasa', 'Flat Coated Retriever', 'Curly Coated Retriever', 'Golden Retriever', 'Labrador Retriever', 'Chesapeake Bay Retriever', 'German Short Haired Pointer', 'Vizsla', 'English Setter', 'Irish Setter', 'Gordon Setter', 'Brittany Spaniel', 'Clumber', 'English Springer', 'Welsh Springer Spaniel', 'Cocker Spaniel', 'Sussex Spaniel', 'Irish Water Spaniel', 'Kuvasz', 'Schipperke', 'Groenendael', 'Malinois', 'Briard', 'Kelpie', 'Komondor', 'Old English Sheepdog', 'Shetland Sheepdog', 'Collie', 'Border Collie', 'Bouvier Des Flandres', 'Rottweiler', 'German Shepherd', 'Doberman', 'Miniature Pinscher', 'Greater Swiss Mountain Dog', 'Bernese Mountain Dog', 'Appenzeller', 'Entlebucher', 'Boxer', 'Bull Mastiff', 'Tibetan Mastiff', 'French Bulldog', 'Great Dane', 'Saint Bernard', 'Eskimo Dog', 'Malamute', 'Siberian Husky', 'Affenpinscher', 'Basenji', 'Pug', 'Leonberg', 'Newfoundland', 'Great Pyrenees', 'Samoyed', 'Pomeranian', 'Chow', 'Keeshond', 'Brabancon Griffon', 'Pembroke', 'Cardigan', 'Toy Poodle', 'Miniature Poodle', 'Standard Poodle', 'Mexican Hairless', 'Dingo', 'Dhole', 'African Hunting Dog']

#! /usr/bin/env python
# getting random file from a directory
# https://stackoverflow.com/questions/701402/best-way-to-choose-a-random-file-from-a-directory
longest = ""
for breed in ALL_BREEDS:
    if len(breed) > len(longest):
        longest = breed
print(longest)
print("American Staffordshire Terrier", len("American Staffordshire Terrier"))
print("German Short Haired Pointer", len("German Short Haired Pointer"))
