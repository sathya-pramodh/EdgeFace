DEPS=flask flask_cors opencv-python
run:
	python3 main.py

deps:
	pip install $(DEPS)

test: 
	cd tests; \
	sh test_get_hand_gesture_prompt.sh; \
	sh test_get_head_gesture_prompt.sh
