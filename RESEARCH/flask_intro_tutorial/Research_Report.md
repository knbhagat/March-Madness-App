# Research Report

## Introduction to Flask

### Summary of Work

I explored how Flask can serve as the backend for our project, handling user authentication, user submissions, game data, and betting odds. I also examined how Flask's RESTful API structure allows communication between frontend and backend, with libraries such as Flask-RESTful for routing, Flask-CORS for cross-origin requests, and Flask-SQLAlchemy for database management. I also watched videos and followed guidelines on how to implement Flask, and I drafted up some basic functions for the backend. 

### Motivation

Our project will use Flask as a python backend. It will connect to our database and provide a restful API for the frontend. I've worked with python before, so I wanted to work on the backend for our project. However, I've also never used Flask, so I wanted to familiarize myself with the product before starting with the code, something that was a shared and agreed sentiment around our group. 

### Time Spent

~5 minutes installing Flask and setting up my environment
~60 minutes following the tutorial
~20 mintues following the "Quickstart"
~35 minutes making my own Flask functions

### Results

I learned all the basics and essentials on how Flask works and how it integrates with the rest of our project. 

I start my installation first[^1]:

```shell
python3 -m venv .venv
source .venv/bin/activate
pip install flask
```

Next I folllowed the Video Tutorial and Quickstart[^2][^3]:

Some of the code that I worked on are in this repository:

This work includes the things that I followed in the video and quickstart, as well as other independent code that I was playing around with. These include initializing flask, hello, handling data processing, API requests, API endpoints, general API calls from the frontend, SQLAlchemy initialization, and a basic user login. Hopefully these are enough examples to help my team understand Flask quicker and more efficiently than I did. 

### Sources

<!--list your sources and link them to a footnote with the source url-->

- Flask Installation[^1]
- Flask Video Tutorial[^2]
- Flask Quickstart[^3]

[^1]: https://flask.palletsprojects.com/en/stable/installation/
[^2]: https://www.youtube.com/watch?v=Z1RJmh_OqeA&ab_channel=freeCodeCamp.org
[^3]: https://flask.palletsprojects.com/en/stable/quickstart/
