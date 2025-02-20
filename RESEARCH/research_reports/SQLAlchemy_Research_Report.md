# Research Report
## Intro to SQLAlchemy/SQL
### Summary of Work
I delved deeper into how SQL works and got practice on SQL commands in order to manipulate a dataset. I also did research on how a toolkit called SQLAlchemy would work in a python environment.
### Motivation
I am interested in working on the backend for this project so understanding how the backend and the database can communicate with each other will be very important to development.
### Time Spent
~90 minutes practicing SQL commands and learning about SQLAlchemy


### Results
SQLAlchemy is a popular toolkit to use with MySQL. Its also an Object Relational Mapper(ORM) which means that it is able to convert data between different systems in Object Oriented Languages. Python does not contain primitive data types; all data is an object which makes it difficult for it to work with MySQL by itself. An ORM acts as an intermediary to allow a backend written in Python to work with MySQL.

The following code snippet is an example on how to create an engine, which is how a user is able to translate SQL queries. The MetaData() function also creates a table that can be added to MySQL. In the example below, an engine is created and a table that contains columns representing id numbers, first names, and last names as columns.
```python
from sqlalchemy import create_engine
engine = create_engine("mysql://user:pwd@localhost/college",echo = True)
meta = MetaData()


students = Table(
   'students', meta, 
   Column('id', Integer, primary_key = True), 
   Column('name', String), 
   Column('lastname', String),
)
meta.create_all(engine)


```
To be able to execute commands, a connection object must be made to communicate with the table. The following code snippet does exactly that. Using the select() function on the table object is the equivalent of using the command “SELECT students.id, students.name, students.lastname FROM students”. The where() function is able to filter any queries, in the example below, all rows are students are being filtered by whether their id is greater than 2 or not.


```python
conn = engine.connect()
s1 = students.select()
s2 = students.select().where(students.c.id>2)


```
To be more confident with data manipulation for that backend, I also made myself a basic guide on how to filter data to pick specific parts of the table.


From the w3schools website I learned commands that are critical to using the databases in SQL and hopefully this will provide a quick guide for other team members on how to manipulate data.
SELECT *column 1*, *column 2*, … is used to select a column from a table.
FROM *table* is used to select a table from the database.
SELECT followed by * is used to select all columns from a table.
The following command is an example on how to select data from a database.
```mysql
SELECT * FROM Users;
```
WHERE *condition* is used to add conditional to a SELECT statement. Where can also be used with numeric values and conditionals.
```mysql
SELECT * FROM Users WHERE Country = ‘Mexico’;
SELECT * FROM Users WHERE Id != 1
SELECT * FROM Users Where Id !=1 AND Country = ‘Mexico’
```
### Sources
- W3Schools SQL Tutorial [^1]
- TutorialsPoint SQLAlchemy Tutorial [^2]
[^1]: https://www.w3schools.com/sql/
[^2] https://www.tutorialspoint.com/sqlalchemy/sqlalchemy_introduction.html

