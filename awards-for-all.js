"use strict";
const { By, until } = require("selenium-webdriver");
const faker = require("faker");

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

module.exports = async function awardsForAll(driver) {
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
};
