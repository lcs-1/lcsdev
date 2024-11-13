while True:
    userinput = input("Please enter add or show or complete or edit or exit: ")
    userinput = userinput.lower().strip()

    if userinput.startswith("add"):
        todo = userinput[4:]

        with open("todos.txt", "r") as file:
            todos = file.readlines()

        todos.append(todo + "\n")

        with open("todos.txt", "w") as file:
            file.writelines(todos)

    elif userinput.startswith("show"):
        with open("todos.txt", "r") as file:
            todos = file.readlines()

        for index, task in enumerate(todos, start=1):
            print(f"Task {index}: {task.capitalize().strip()}")

    elif userinput.startswith("edit"):
        try:
            number = userinput[5:]
            number = int(number) - 1

            with open("todos.txt", "r") as file:
                todos = file.readlines()

            edited_text = input("Please enter the corrected task: ")
            todos[number] = edited_text + "\n"

            with open("todos.txt", "w") as file:
                file.writelines(todos)
        except Exception:
            print("Please enter the tasknumber with edit or enter correct tasknumber ")
            continue

    elif userinput.startswith("complete"):
        try:
            number = userinput[9:]
            number = int(number) - 1

            with open("todos.txt", "r") as file:
                todos = file.readlines()

            print(f"{(todos[number]).strip('\n')} has been completed")

            todos.pop(number)

            with open("todos.txt", "w") as file:
                file.writelines(todos)
        except Exception:
            print("Please enter tasknumner next to complete or valid tasknumber")
            continue
    elif userinput.startswith("exit"):
        break

    else:
        print("Please enter a valid input ")

print("Bye!")
