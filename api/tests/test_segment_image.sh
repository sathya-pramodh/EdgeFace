#!/bin/bash
curl -X GET http://localhost:5000/api/segment-image \
   -F "image=@Adobe Scan 29-Aug-2024 (1)_page-0001.jpg"
