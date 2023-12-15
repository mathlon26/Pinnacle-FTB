import eel
import threading
from datetime import datetime
import json
import os
import sys
import time

class Load():
    def __init__(self) -> None:
        self.loading = True
        
loadObj = Load()

def load_app():
    os.system('cls')
    rapport = Logger().create_rapport(level=3, kind=6, msg="Starting application...", color="GREEN")
    rapport = Logger().format_rapport(rapport=rapport)[9:-1]
    while loadObj.loading:
        for i in ["-", "\\", "|", "/", "-","\\", "|", "/"]:
            j = datetime.now().strftime("%H:%M:%S")
            time.sleep(0.1)
            print(f"\033[97m [{j}{rapport}\033[95m{i}", end='\r', flush=True)
    else:
        time.sleep(0.5)
        input_thread.start()
        input_thread.join()
        
        
        

load_thread = threading.Thread(target=load_app)

class Logger():
    def __init__(self) -> None:
        self.commands = {
            "quit": self.cmd_quit,
            "js": self.cmd_jsconsole,
            "help": self.cmd_help,
            "git": self.cmd_git,
            "info": self.cmd_info,
            "bot": self.cmd_bot,
            "trade": self.cmd_trade,
            "restart": self.cmd_restart
        }
        self.config = get_config()["logger"]
        self.enabled = self.config["enabled"]
        self.log_path = self.config["log_path"]
        
    def input_handler(self):
        os.system('cls')
        while not loadObj.loading:
            user_input = input("\033[95mCommand:>\033[97m ")
            self.handle_command(user_input)
    
    def create_rapport(self, level=None, kind=None, msg=None, color=None, time=True):
        color_map = {
            "BLUE": "\033[94m",
            "RED": "\033[91m",
            "GREEN": "\033[92m",
            "CYAN": "\033[96m",
            "YELLOW": "\033[93m",
            "MAGENTA": "\033[95m",
            "WHITE": "\033[97m"
        }

        level_color_map = {
            "DEBUG": "BLUE",
            "INFO": "GREEN",
            "MAIN": "CYAN",
            "SERVER": "YELLOW",
            "APP": "MAGENTA",
            "?": "WHITE"
        }

        level_map = {
            0: "?",
            1: "DEBUG",
            2: "INFO",
            3: "MAIN",
            4: "SERVER",
            5: "APP",
            6: "ERROR"
        }
        kind_map = {
            0: "?",
            1: "GET",
            2: "POST",
            3: "SET",
            4: "CALC",
            5: "EDIT",
            6: "EXEC"
        }
        
        if level in level_map.keys():
            _level = level_map[level]
        elif type(level) == str:
            _level = level
        else:
            _level = level_map[0]
        if _level in level_color_map.keys():
            _level = f'{color_map[level_color_map[_level]]}{_level}{color_map["WHITE"]}'
            
        if kind in kind_map.keys():
            _kind = kind_map[kind]
        elif type(kind) == str:
            _kind = kind
        else:
            _kind = kind_map[0]
            
        if color in color_map.keys():
            msg = f'{color_map[color]}{msg}{color_map["WHITE"]}'
            
        if time:
            current_time = datetime.now().strftime("%H:%M:%S")
            time = f"[{current_time}]"
            return {"time": time,"level": _level, "type": _kind, "msg": msg}          

        return {"level": _level, "type": _kind, "msg": msg}
            
    def format_rapport(self, rapport):
        if 'time' in rapport.keys():
            formatted_output = f"{rapport['time']} | [{rapport['level']}] : {rapport['type']} - {rapport['msg']} -"
        else:
            formatted_output = f"[{rapport['level']}] : {rapport['type']} - {rapport['msg']} -"

        return formatted_output
        
    def _print(self, msg=None, rapport=None, loading=False, clear_first=False):
        if clear_first:
            os.system('cls')

        if msg:
            print(f'\n\033[97m[main]: {msg}')
        elif rapport:
            rapport = self.format_rapport(rapport)
            os.system('cls')
            print('\033[F', end='')
            print(f'\033[97m{rapport}')
            print('', end='', flush=True)
            with open(self.log_path, "a") as file:
                file.write(rapport)
        
        return
            
    def handle_command(self, command):
            with open(self.log_path, "a") as file:
                file.write(f"Command:> {command}")
            command_parts = command.split(" ")
            main_command = command_parts[0]

            if main_command in self.commands:
                self.commands[main_command](command_parts[1:])
            else:
                if command == '':
                    main_command ="None given"
                rapport = self.create_rapport(level=6, kind=6, msg=f"Unknown command: {main_command}", color="RED")
                self._print(rapport=rapport)
                time.sleep(2)
                rapport = self.create_rapport(level=2, kind=0, msg=f'Try the "help" command to get started', color="WHITE")
                self._print(rapport=rapport)
                        
    def cmd_quit(self, args):
        if not args or args[0] == "--console":
            eel.stop_all()
            rapport = self.create_rapport(level=3, kind=6, msg="Exiting application...", color="RED")
            self._print(rapport=rapport, clear_first=True)
            sys.exit()
            quit()
            
            
        else:
            rapport = self.create_rapport(level=0, kind=6, msg="Invalid arguments for quit command", color="RED")
            self._print(rapport=rapport)

    def cmd_jsconsole(self, args):
        # Implement the functionality for the "js" command
        # You can use args to handle any additional parameters for this command
        # Example:
        rapport = self.create_rapport(level=6, kind=0, msg="Executing JS console command", color="BLUE")
        self._print(rapport=rapport)

    def cmd_help(self, args):
        # Implement the functionality for the "help" command
        # This example lists all available commands and their descriptions
        help_text = """
        Available Commands:
        - quit [--console]: Quit the application or console.
        - js: Execute JS console command.
        - help: Display help information.
        - git: Get information about the GitHub repository.
        - info: Display version, author, and project information.
        - bot: Manage bot commands.
        - trade: Execute trade command.
        """
        rapport = self.create_rapport(level=2, kind=6, msg=help_text, color="CYAN")
        self._print(rapport=rapport)

    def cmd_git(self, args):
        # Implement the functionality for the "git" command
        # Provide information about the GitHub repository
        git_info = f"\nGitHub Repository: https://github.com/mathlon26/Pinnacle-FTB\n\033]8;;https://github.com/mathlon26/Pinnacle-FTB\033\\Click here to visit the GitHub page\033]8;;\033\\"
        rapport = self.create_rapport(level=2, kind=6, msg=git_info, color="GREEN")
        self._print(rapport=rapport)

    def cmd_info(self, args):
        # Implement the functionality for the "info" command
        # Display version, author, and project information
        version_info = "\nVersion: 1.0"
        author_info = "Author: mathlon26"
        project_info = "Project: Pinnacle-FTB"
        rapport = self.create_rapport(level=2, kind=6, msg=f"{version_info}\n{author_info}\n{project_info}", color="YELLOW")
        self._print(rapport=rapport)

    def cmd_bot(self, args):
        # Implement the functionality for the "bot" command
        # Example:
        rapport = self.create_rapport(level=6, kind=6, msg="Managing bot commands", color="MAGENTA")
        self._print(rapport=rapport)

    def cmd_trade(self, args):
        # Implement the functionality for the "trade" command
        # Example:
        rapport = self.create_rapport(level=6, kind=6, msg="Executing trade command", color="WHITE")
        self._print(rapport=rapport)
        
    def cmd_restart(self, args):
        # Implement the functionality for the "restart" command
        rapport = self.create_rapport(level=2, kind=6, msg="Restarting application...", color="YELLOW")
        self._print(rapport=rapport, clear_first=True)
        
        os.system(".\\restart_script.bat")
        self.cmd_quit(None)
                
      
class Bot():
    def __init__(self) -> None:
        self.status = {"running": False}
    
    def get_bot_status(self, arg=None):
        status = self.status
        if arg:
            status = status[arg]
        status = json.dumps(status)
        return json.loads(status)
    
    def start_bot(self):
        if not self.status["running"]:
            self.status["running"] = True
            rapport = Logger().create_rapport(
                level=5, kind=6, msg="Try: start_bot() - Result: Bot started successfully", color="GREEN"
            )
            Logger()._print(rapport=rapport)
            return True
        else:
            rapport = Logger().create_rapport(
                level=5, kind=6, msg="Try: start_bot() - Result: Bot is already running", color="YELLOW"
            )
            Logger()._print(rapport=rapport)
            return False
    
    def stop_bot(self):
        if self.status["running"]:
            self.status["running"] = False
            rapport = Logger().create_rapport(
                level=5, kind=6, msg="Try: stop_bot() - Result: Bot stopped successfully", color="RED"
            )
            Logger()._print(rapport=rapport)
            return True
        else:
            rapport = Logger().create_rapport(
                level=5, kind=6, msg="Try: stop_bot() - Result: Bot is not currently running", color="YELLOW"
            )
            Logger()._print(rapport=rapport)
            return False
    
    
bot = Bot()
@eel.expose
def start_bot():
    return bot.start_bot()

@eel.expose
def stop_bot():
    return bot.stop_bot()

@eel.expose
def get_bot_status(arg=None):
    return bot.get_bot_status(arg=arg)

@eel.expose
def get_config():
    with open("config.json", "r") as file:
        return json.load(file)

@eel.expose
def save_config(json_text):
    updated_config = json.loads(json_text)

    with open("config.json", "w") as file:
        json.dump(updated_config, file, indent=2)
    
    
@eel.expose
def all_loaded():
    loadObj.loading = False
    time.sleep(1)
    Logger()._print(rapport=Logger().create_rapport(level=2, kind=0, msg="Loading complete", color="GREEN"))
    print("\033[95mCommand:>\033[97m ", end='', flush=True)
    return bool(True) 


def eel_handler():
    eel.init('web', allowed_extensions=['.js', '.html', '.css'])  
    eel.start('main.html', mode='chrome', port=8080, size=(800, 600), titlebar=False)
    


eel_thread = threading.Thread(target=eel_handler)
input_thread = threading.Thread(target=Logger().input_handler)

load_thread.start()
eel_thread.start()

load_thread.join()
eel_thread.join()


