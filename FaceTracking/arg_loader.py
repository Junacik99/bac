from ast import arg
import sys


# Returns the first cmd argument as a mode for face tracking
# If no arguments are given, default webcam will be used
# If there is 1 or more arguments, the first argument will be used as a mode
# If the first argument is int type, it will be used as an index for webcam,
# otherwise it will be used as the path for the input video
def load_arguments(args):
    if len(args) > 2:
        print("Too many arguments. The first will be considered as an input mode.")
    elif len(args) < 2:
        print("No input mode specified. Default webcam will be used.")
        return 0
    
    try:
        return int(args[1])
    except:
        return args[1]