import random

HEAD_GESTURES = [
    "Raise your eyebrows as if surprised.",
    "Turn your head to the left.",
    "Turn your head to the right.",
    "Smile widely.",
    "Frown and then relax your face.",
    "Close your eyes for two seconds and then open them.",
    "Open your mouth wide and close it.",
    "Tilt your head up to look at the ceiling.",
    "Tilt your head down to look at the floor.",
    "Nod your head up and down slowly.",
    "Shake your head from side to side slowly.",
    "Wink slowly with your left eye.",
    "Wink slowly with your right eye.",
]


def generate_head_gesture():
    """
    Generate a random head gesture from a set of choices in `HEAD_GESTURES`.
    """
    return random.choice(HEAD_GESTURES)
