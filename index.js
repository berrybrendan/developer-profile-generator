const inquirer = require("inquirer");
const axios = require("axios");
const fs = require("fs");
var pdf = require('html-pdf');
var options = { format: 'Tabloid', orientation: "portrait" };
const util = require("util");
const g_html = require('./generateHTML.js')

const writeFileAsync = util.promisify(fs.writeFile);
var html;
var starsAwesomeFunctionReturn = 0;


const questions = ["What is your GitHub username?", "What is your favorite color?"];


function promptUser() {
  return inquirer.prompt([
    {
      type: "input",
      name: "user",
      message: questions[0]
    },
    {
      type: "list",
      name: "color",
      message: questions[1],
      choices: [
        "green",
        "blue",
        "pink",
        "red"
      ]
    }
  ])
}

function starCountingAwesomeFunction(data){
  const queryUrl = `https://api.github.com/users/${data.user}/repos?per_page=100`;

  axios.get(queryUrl).then(function(res) {
    const repoStars = res.data.map(function(repo) {
      return repo.stargazers_count;
    });
    // console.log(repoStars)
    repoStars.forEach(el => {
      starsAwesomeFunctionReturn+= el;
    })
    // console.log(starsAwesomeFunctionReturn)
    gitHubCall(data)
    
  });
};

function gitHubCall(data){
    const userName = data.user;
    const favColor = data.color;


    const queryUrl = `https://api.github.com/users/${userName}`;

    axios.get(queryUrl).then(function(res) {


        const userObject = {
            user: userName,
            name: res.data.name,
            company: res.data.company,
            location: res.data.location,
            public_repos: res.data.public_repos,
            followers: res.data.followers,
            following: res.data.following,
            picURL: res.data.avatar_url,
            userProfile: res.data.html_url,
            userBio: res.data.bio,
            color: favColor,
            stars: starsAwesomeFunctionReturn,
            blog: res.data.blog
        }
        userObject.stars = starsAwesomeFunctionReturn;
        
        // console.log("thing is:" + starsAwesomeFunctionReturn)
        // console.log(userObject)
        const htmlUser = g_html.generateHTML(userObject);
        // writeFileAsync("index.html", htmlUser);
        pdf.create(htmlUser, options).toFile(`./${userName}.pdf`, function(err, res) {
            if (err) return console.log(err);
            console.log(res);
        });

        

    });
}


promptUser()
    .then(function(answers) {
      starCountingAwesomeFunction(answers);
  })
  .then(function() {
    console.log("Successfully wrote to index.html");
  })
  .catch(function(err) {
    console.log(err);
  });