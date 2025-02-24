##How to Containerize (DB, Frontend, Backend)

### Summary of Work

Containerizing the frontend and backend is different than the database. You need to create a specialized Dockerfile in both the frontend and backend directories, but not the database. This is because mysql uses pre-made image information from Docker. Once the Dockerfiles are created in the backend and frontend directories, in the main directory, you create a .yml file (a docker compose file). In the docker compose file, which contains the containers for the frontend, backend, and DB, all three components run in isolated containers but are able to communicate with each other.

### Motivation
Dockerizing is new to me, I'm not sure if it's new to them, but I want to give my team references and shared what I learned if they need the help.

### Time Spent

~45 minutes

## Note about research report
I am not going in depth about the frontend or backend containerization, just applying the resources to learn how to do it. My job this week is to containerize the DB, but in order to do so, I learned about containerizing the frontend and backend to get a better idea what the final product should look like and where my responibiliies begin and end.

### Step 1 - Frontend
[^1]

### Step 2 - Backend
[^2]

### Step 3 - DB

After understanding that I do not need to create a specialized Dockerfile for containerizing the DB, I looked at Devtech2, for help on how to containerize the DB.


### Sources

- React Dockerize[^1]
- Python Dockerize[^2]

[^1]: https://www.docker.com/blog/how-to-dockerize-react-app/
[^2]: https://www.geeksforgeeks.org/setting-up-docker-for-python-projects-a-step-by-step-guide/#google_vignette
