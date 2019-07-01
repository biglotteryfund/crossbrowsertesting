"use strict";
require("dotenv").config();
const { Builder } = require("selenium-webdriver");
const request = require("request");

function setScore(sessionId, score) {
  return new Promise((resolve, reject) => {
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
      result.error = false;
      result.message = "success";
    }

    result.error ? reject("Fail") : resolve("Pass");
  });
}

async function startTest(driver, suiteFn) {
  driver.getSession().then(async function(session) {
    const sessionId = session.id_;
    console.log("Session ID: ", sessionId);
    if (process.env.CI) {
      console.log(
        "See your test run at: https://app.crossbrowsertesting.com/selenium/" +
          sessionId
      );
    }

    try {
      await suiteFn(driver);

      setScore(sessionId, "pass").then(function() {
        console.log("SUCCESS! set score to pass");
      });

      driver.quit();
    } catch (err) {
      console.error("Something went wrong!\n", err.stack, "\n");
      driver.quit();

      setScore(sessionId, "fail")
        .then(function() {
          console.log("FAILURE! set score to fail");
          process.exit(1);
        })
        .catch(scoreErr => {
          console.error("Failed to set status!\n", scoreErr.stack, "\n");
          process.exit(1);
        });
    }
  });
}

const awardsForAll = require("./awards-for-all");

if (process.env.CI) {
  [
    { browserName: "Edge", version: "18", platform: "Windows 10" },
    {
      browserName: "Internet Explorer",
      version: "11",
      platform: "Windows 8.1"
    },
    { browserName: "Chrome", platform: "Windows 10" }
  ].forEach(browser => {
    const driver = new Builder()
      .usingServer("http://hub.crossbrowsertesting.com:80/wd/hub")
      .withCapabilities({
        name: "Awards for all",
        build: "1.0",
        browserName: browser.browserName,
        version: browser.version ? browser.version : null,
        platform: browser.platform,
        screen_resolution: "1600x1200",
        record_video: "true",
        record_network: "false",
        username: process.env.CBT_USERNAME,
        password: process.env.CBT_AUTHKEY
      })
      .build();

    console.log(
      `Starting test for ${browser.browserName} on ${browser.platform}`
    );
    startTest(driver, awardsForAll);
  });
} else {
  const driver = new Builder().forBrowser("safari").build();
  console.log("Starting local test");
  startTest(driver, awardsForAll);
}
