def ispalindrome(str):
    start_index=0
    end_index=len(str)-1
    for x in str:
        if str[start_index]!=str[end_index]:
            return False
    return True

print(ispalindrome('racecar'))