"use strict";
require("dotenv").config();
const { Builder, By, until } = require("selenium-webdriver");
const faker = require("faker");
const request = require("request");

const caps = {
  name: "Awards for all",
  build: "1.0",
  // version: "70",
  // platform: "Windows 10",
  screen_resolution: "1600x1200",
  record_video: "true",
  record_network: "false",
  browserName: "Edge",
  username: process.env.CBT_USERNAME,
  password: process.env.CBT_AUTHKEY
};

async function login(driver) {
  await driver
    .findElement(By.id("field-username"))
    .sendKeys(process.env.TEST_USERNAME);

  await driver
    .findElement(By.id("field-password"))
    .sendKeys(process.env.TEST_PASSWORD);

  await driver
    .findElement(By.css('.form-actions input[type="submit"]'))
    .click();
}

async function eligibilityStep(driver) {
  await driver
    .findElement(By.xpath("//label[contains(text(), 'Yes')]"))
    .click();
  await driver
    .findElement(By.css('.form-actions input[type="submit"]'))
    .click();

  await driver.sleep(1000);
}

async function submitStep(driver) {
  await driver
    .findElement(By.css('.form-actions input[type="submit"]'))
    .click();
}

async function stepProjectDetails(driver) {
  await driver
    .findElement(By.id("field-projectName"))
    .sendKeys("My Application");

  await driver
    .findElement(By.css("input[name='projectDateRange[startDate][day]']"))
    .sendKeys("1");
  await driver
    .findElement(By.css("input[name='projectDateRange[startDate][month]']"))
    .sendKeys("6");
  await driver
    .findElement(By.css("input[name='projectDateRange[startDate][year]']"))
    .sendKeys("2020");

  await driver
    .findElement(By.css("input[name='projectDateRange[endDate][day]']"))
    .sendKeys("1");
  await driver
    .findElement(By.css("input[name='projectDateRange[endDate][month]']"))
    .sendKeys("6");
  await driver
    .findElement(By.css("input[name='projectDateRange[endDate][year]']"))
    .sendKeys("2020");
}

async function stepProjectCountry(driver) {
  await driver.findElement(By.css("input[value='scotland']")).click();
}

async function stepProjectLocation(driver) {
  await driver
    .findElement(
      By.css("#field-projectLocation > optgroup > option[value=highlands]")
    )
    .click();

  await driver
    .findElement(By.id("field-projectLocationDescription"))
    .sendKeys(faker.lorem.sentence());

  await driver.findElement(By.id("field-projectPostcode")).sendKeys("KW8 6JF");
}

async function stepYourIdea(driver) {
  await driver
    .findElement(By.id("field-yourIdeaProject"))
    .sendKeys(faker.lorem.words(51));

  await driver
    .findElement(By.id("field-yourIdeaPriorities"))
    .sendKeys(faker.lorem.words(51));

  await driver
    .findElement(By.id("field-yourIdeaCommunity"))
    .sendKeys(faker.lorem.words(51));
}

let sessionId = null;

async function awardsForAll(driver) {
  if (process.env.CI) {
    await driver.getSession().then(function(session) {
      sessionId = session.id_; //need for API calls
      console.log("Session ID: ", sessionId);
      console.log(
        "See your test run at: https://app.crossbrowsertesting.com/selenium/" +
          sessionId
      );
    });
  }

  await driver.get(`${process.env.TEST_BASE_URL}/apply/awards-for-all/new`);

  await driver
    .manage()
    .window()
    .maximize();

  await driver.findElement(By.css(".cookie-consent__actions .btn")).click();
  await login(driver);

  await driver.wait(until.titleContains("Project details"));
  await stepProjectDetails(driver);
  await submitStep(driver);
  await driver.wait(until.titleContains("Project country"));
  await stepProjectCountry(driver);
  await submitStep(driver);
  await driver.wait(until.titleContains("Project location"));
  await stepProjectLocation(driver);
  await submitStep(driver);
  await driver.wait(until.titleContains("Your idea"));
  await stepYourIdea(driver);
  await submitStep(driver);
}

function setScore(score) {
  return new Promise((resolve, fulfill) => {
    let result = { error: false, message: null };

    if (sessionId) {
      request(
        {
          method: "PUT",
          uri: `https://crossbrowsertesting.com/api/v3/selenium/${sessionId}`,
          body: { action: "set_score", score: score },
          json: true
        },
        function(error, response, body) {
          if (error) {
            result.error = true;
            result.message = error;
          } else if (response.statusCode !== 200) {
            result.error = true;
            result.message = body;
          } else {
            result.error = false;
            result.message = "success";
          }
        }
      ).auth(process.env.CBT_USERNAME, process.env.CBT_AUTHKEY);
    } else {
      result.error = true;
      result.message = "Session Id was not defined";
      resolve(result);
    }

    result.error ? fulfill("Fail") : resolve("Pass");
  });
}

async function startTest() {
  let driver;

  if (process.env.CI) {
    driver = new Builder()
      .usingServer("http://hub.crossbrowsertesting.com:80/wd/hub")
      .withCapabilities(caps)
      .build();
  } else {
    driver = new Builder().forBrowser("safari").build();
  }

  console.log("Starting test");

  try {
    await awardsForAll(driver);

    setScore("pass").then(function(result) {
      console.log(result);
      console.log("SUCCESS! set score to pass");
    });

    driver.quit();
  } catch (err) {
    console.error("Something went wrong!\n", err.stack, "\n");
    driver.quit();
    setScore("fail").then(function(result) {
      console.log(result);
      console.log("FAILURE! set score to fail");
    });
  }
}

startTest();
