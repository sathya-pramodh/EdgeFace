import random

HAND_GESTURES = [
    "Touch your nose with your right hand.",
    "Touch your nose with your left hand.",
    "Pinch your fingers together slowly.",
    "Wave your right hand.",
    "Wave your left hand.",
    "Touch your right ear with your left hand.",
    "Touch your left ear with your right hand.",
    "Clap your hands twice gently.",
    "Place your right hand on top of your head.",
    "Place your left hand on top of your head.",
    "Raise your right hand as if to ask a question.",
    "Raise your left hand as if to ask a question.",
    "Cover your mouth with your right hand for a moment.",
    "Cover your mouth with your left hand for a moment.",
    "Touch your chin with your right hand.",
    "Touch your chin with your left hand.",
    "Place both hands on your cheeks and hold for two seconds.",
    "Point to the left with your right hand.",
    "Point to the right with your left hand.",
    "Place your right hand on your chest.",
    "Place your left hand on your chest.",
    "Raise both hands above your head.",
    "Lower both hands to your sides.",
    "Put your right hand on your shoulder.",
    "Put your left hand on your shoulder.",
]


def generate_hand_gesture():
    """
    Generate a random hand gesture from a set of choices in `HAND_GESTURES`.
    """
    return random.choice(HAND_GESTURES)
