DEPS=flask flask_cors opencv-python tensorflow pillow matplotlib
run:
	python3 main.py

deps:
	pip install $(DEPS)

test: 
	cd tests; \
	sh test_segment_image.sh
