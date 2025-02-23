# Research Report

## How to Code APIs

### Summary of Work

I researched out to code an API in java. I also researched free API's that we could do. Then afterward, I thought about the future of the project, and what we would need to complete before beginning the API.

### Motivation

Our project will use an API for the betting odds. We will get them from an API and put them into our project. As the API is essentially the basis of our project, I thought it would be good for me to research about APIs, understand them further as I've never coded APIs in Python.

### Time Spent

~20 minutes finding and figuring out how to code APIs in java

~35 minutes looking for the best API's to use and why

~15 minutes thinking about the future of the project, and when I would be able to implement the research I did right now

### Results

I started by reading this article[^1].

I learned that you need to create API requests in python. First you install the requests.

```shell
pip3 install requests
```

Then you import the requests.

```shell
import requests
```

Finally, when you access the API, you need an API key, which is like a passcode that allows us to be able to retrieve the data from the API. I also learned that "status_code" is how you check the HTTP response status of your request. Therefore it is a tool I will use in the future for debugging and checking if my API request was successful.

```shell
import requests

# Replace 'API_KEY' with your actual API key from NewsAPI
API_KEY = '3805f6bbabcb42b3a0c08a489baf603d'
url = f"https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey={API_KEY}"
response = requests.get(url)
print(response.status_code)
```
Those were the basic idea's that I took away. But in the article I also read about how you can open the API url and read the data (using JSON), which is a function that our project will include. I will reference this article again when it is time to code.

Finally, I double checked this was the correct way to code API's by looking at another article. This article ended up being better and more in depth than the one I initially read, and it helped me understand that an API uses HTTP requests for communication to websites. Which makes sense as in python you need to import "requests" so that the API can request the information that you need from the website[^2].

Next, I researched what API's we could use for our project. I found one called the odds API[^3]. It is able to gather betting odds for sports. 

But while I was researching this, I thought that we may need an API, before March Madness starts, that displays the top 64 teams most likely to be in March Madness. I found a reddit threat that has a free API that shows the top 25 teams in college basketball[^4]. We should use this before March Madness begins, combined with our API for betting odds, to create a way for users to bet and interact on our project before March Madness begins.


After understanding APIs, I spent about 15 minutes figuring out how we should approach this project because I was thinking how if we applied API's in the beginning, it would be a confusing as we wouldn't have any other necessary parts of the project done, parts of the project that a user needs to access and use before betting. At the time we didn't have a plan on what to do and between our group it was very ambiguous what our roles were. So I thought, for the backend, how we shouldn't do the API coding first, and we should focus on the user login screen and making sure our database is correctly connected with our backend. Then we should start adding our APIs, first we should add the teams, then the odds, different UI screens for betting, settings, etc., then try to combine all of it towards the end.

Therefore, in my research, I learned what API's are and how to apply it to our project, and I also considered, thought about, and planned ahead for when the API's would be in the project and the best for me to apply this knowledge.


### Sources

- Tutorial - getting started with APIs[^1]
- How to code APIs[^2]
- Free sports betting API[^3]
- Top 25 API[^4]

[^1]: https://www.geeksforgeeks.org/python-api-tutorial-getting-started-with-apis/
[^2]: https://rapidapi.com/blog/how-to-use-an-api-with-python/
[^3]: https://the-odds-api.com/liveapi/guides/v4/samples.html
[^4]: https://www.reddit.com/r/CollegeBasketball/comments/1ario06/free_api_for_live_scores_stats_standings_and/

