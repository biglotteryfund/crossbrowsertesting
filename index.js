"use strict";
require("dotenv").config();
const { Builder } = require("selenium-webdriver");
const request = require("request");
const awardsForAll = require("./awards-for-all");

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

async function remoteTest(name, suiteFn) {
  console.log(`Starting remote test: ${name}`);

  const browserVersions = [
    { browserName: "Chrome", platform: "Windows 10" },
    { browserName: "Edge", platform: "Windows 10" },
    { browserName: "Internet Explorer", version: "11", platform: "Windows 8.1" }
  ];

  browserVersions.forEach(browser => {
    const driver = new Builder()
      .usingServer("http://hub.crossbrowsertesting.com:80/wd/hub")
      .withCapabilities({
        name: name,
        build: process.env.TRAVIS_BUILD_NUMBER
          ? `CI-BUILD-${process.env.TRAVIS_BUILD_NUMBER}`
          : "dev",
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

    driver.getSession().then(async function(session) {
      const testUrl = `https://app.crossbrowsertesting.com/selenium/${session.id_}`;
      console.log(
        `Starting test for ${browser.browserName} on ${browser.platform}: ${testUrl}`
      );

      try {
        await suiteFn(driver);
        driver.quit();

        setScore(session.id_, "pass")
          .then(function() {
            console.log("SUCCESS! set score to pass");
          })
          .catch(scoreErr => {
            console.error("Failed to set status!\n", scoreErr.stack, "\n");
            process.exit(1);
          });
      } catch (err) {
        console.error("Something went wrong!\n", err.stack, "\n");
        driver.quit();

        setScore(session.id_, "fail")
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
  });
}

async function localTest(name, suiteFn) {
  const driver = new Builder().forBrowser("safari").build();
  console.log(`Starting local test: ${name}`);
  suiteFn(driver);
}

if (process.env.CI) {
  remoteTest("Awards for all", awardsForAll);
} else {
  localTest("Awards for all", awardsForAll);
}
