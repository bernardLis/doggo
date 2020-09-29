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

data = [
['Chihuahua','smol','short'],
['Japanese Spaniel','smol','long'],
['Maltese Dog','smol','long'],
['Pekinese','smol','long'],
['Shih Tzu','smol','long'],
['Blenheim Spaniel','smol','long'],
['Papillon','smol','long'],
['Toy Terrier','smol','short'],
['Rhodesian Ridgeback','big','short'],
['Afghan Hound','big','long'],
['Basset','smol','short'],
['Beagle','medium','short'],
['Bloodhound','big','short'],
['Bluetick','big','short'],
['Black And Tan Coonhound','big','short'],
['Walker Hound','medium','short'],
['English Foxhound','medium','short'],
['Redbone','medium','short'],
['Borzoi','big','long'],
['Irish Wolfhound','big','long'],
['Italian Greyhound','smol','short'],
['Whippet','medium','short'],
['Ibizan Hound','big','short'],
['Norwegian Elkhound','medium','long'],
['Otterhound','big','long'],
['Saluki','medium','short'],
['Scottish Deerhound','big','long'],
['Weimaraner','medium','short'],
['Staffordshire Bullterrier','smol','short'],
['American Staffordshire Terrier','smol','short'],
['Bedlington Terrier','smol','long'],
['Border Terrier','smol','long'],
['Kerry Blue Terrier','smol','long'],
['Irish Terrier','smol','long'],
['Norfolk Terrier','smol','long'],
['Norwich Terrier','smol','long'],
['Yorkshire Terrier','smol','long'],
['Wire Haired Fox Terrier','medium','long'],
['Lakeland Terrier','smol','long'],
['Sealyham Terrier','smol','long'],
['Airedale','big','long'],
['Cairn','smol','long'],
['Australian Terrier','smol','short'],
['Dandie Dinmont','smol','long'],
['Boston Bull','smol','short'],
['Miniature Schnauzer','smol','long'],
['Giant Schnauzer','medium','long'],
['Standard Schnauzer','smol','long'],
['Scotch Terrier','smol','long'],
['Tibetan Terrier','smol','long'],
['Silky Terrier','smol','long'],
['Soft Coated Wheaten Terrier','smol','long'],
['West Highland White Terrier','smol','long'],
['Lhasa','smol','long'],
['Flat Coated Retriever','big','long'],
['Curly Coated Retriever','big','long'],
['Golden Retriever','big','long'],
['Labrador Retriever','big','short'],
['Chesapeake Bay Retriever','medium','long'],
['German Short Haired Pointer','medium','short'],
['Vizsla','medium','short'],
['English Setter','medium','long'],
['Irish Setter','big','long'],
['Gordon Setter','big','long'],
['Brittany Spaniel','medium','long'],
['Clumber','medium','long'],
['English Springer','medium','long'],
['Welsh Springer Spaniel','smol','long'],
['Cocker Spaniel','medium','long'],
['Sussex Spaniel','smol','long'],
['Irish Water Spaniel','medium','long'],
['Kuvasz','big','long'],
['Schipperke','smol','long'],
['Groenendael','big','long'],
['Malinois','big','short'],
['Briard','medium','long'],
['Kelpie','medium','short'],
['Komondor','medium','long'],
['Old English Sheepdog','medium','long'],
['Shetland Sheepdog','smol','long'],
['Collie','medium','short'],
['Border Collie','medium','long'],
['Bouvier Des Flandres','big','long'],
['Rottweiler','medium','short'],
['German Shepherd','medium','short'],
['Doberman','big','short'],
['Miniature Pinscher','smol','short'],
['Greater Swiss Mountain Dog','big','short'],
['Bernese Mountain Dog','medium','long'],
['Appenzeller','big','short'],
['Entlebucher','medium','short'],
['Boxer','medium','short'],
['Bull Mastiff','big','short'],
['Tibetan Mastiff','big','long'],
['French Bulldog','smol','short'],
['Great Dane','big','short'],
['Saint Bernard','big','long'],
['Eskimo Dog','big','long'],
['Malamute','big','long'],
['Siberian Husky','medium','long'],
['Affenpinscher','smol','long'],
['Basenji','smol','short'],
['Pug','smol','short'],
['Leonberg','big','long'],
['Newfoundland','big','long'],
['Great Pyrenees','big','long'],
['Samoyed','medium','long'],
['Pomeranian','smol','long'],
['Chow','big','long'],
['Keeshond','smol','long'],
['Brabancon Griffon','smol','short'],
['Pembroke','smol','short'],
['Cardigan','smol','short'],
['Toy Poodle','smol','long'],
['Miniature Poodle','smol','long'],
['Standard Poodle','medium','long'],
['Mexican Hairless','medium','short'],
['Dingo','medium','short'],
['Dhole','medium','short'],
['African Hunting Dog','medium','short']
]

for d in data:
    if (d[1] == 'smol'):
        d[1] = 0
    if (d[1] == 'medium'):
        d[1] = 1
    if (d[1] == 'big'):
        d[1] = 2
    if (d[2] == 'short'):
        d[2] = 0
    if (d[2] == 'long'):
        d[2] = 1

    print(d)
    db.execute("INSERT INTO breedCharacteristics (breed, size, hair) VALUES (?, ?, ?)",
                        (d[0], d[1], d[2]))
