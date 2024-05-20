import random
import string

def get_password(num_length,number=True,special_character=True):
    letter=string.ascii_letters
    digit=string.digits
    special=string.punctuation

    character=letter
    if number:
        character+=digit
    if special_character:
        character+=special

    pwd=""
    condition=False
    hav_num=False
    hav_spc=False

    while not condition or len(pwd) <num_length:
        new=random.choice(character)
        pwd+=new

        if new in digit:
         hav_num=True
        if new in special:
         hav_spc=True
        
        condition=True

        if number:
           condition=hav_num
        elif special_character:
           condition=condition and hav_spc

    return pwd

num_length=int(input("Enter the strength of password: "))   
numbers=input("Do you want numbers in password(y/n): ").lower()=="y"
special_character=input("Do you want special character(y/n): ").lower()=="y"
pwd=get_password(num_length,numbers,special_character)

print(pwd)

    