while True:
    userinput = input("Please enter add or show or complete or edit or exit: ")
    userinput = userinput.lower().strip()
    
    if 'add' in userinput:
        todo = userinput[4:]
        
        with open('todos.txt','r') as file:
            todos = file.readlines()
            
        todos.append(todo + '\n')
        
        with open('todos.txt','w') as file:
            file.writelines(todos)
    
    elif 'show' in userinput:
        with open('todos.txt','r') as file:
            todos = file.readlines()
        
        for index,task in enumerate(todos,start=1):
            print(f"Task {index}: {task.capitalize().strip()}")
    
    elif 'edit' in userinput:
        number = userinput[5:]
        number = int(number)-1
        
        with open('todos.txt','r') as file:
            todos = file.readlines()
            
        edited_text = input("Please enter the corrected task: ")
        todos[number] = edited_text + '\n'
        
        with open('todos.txt','w') as file:
            file.writelines(todos)
    
    elif 'complete' in userinput:
        number = userinput[9:]
        number = int(number)-1
        
        with open('todos.txt','r') as file:
            todos = file.readlines()
        
        print(f"{(todos[number]).strip('\n')} has been completed")
        
        todos.pop(number)
        
        with open('todos.txt','w') as file:
            file.writelines(todos)
    
    elif 'exit' in userinput:
        break
    
    else:
        print("Please enter a valid input ")
        
print("Bye!")
