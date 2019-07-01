"use strict";
const { By, until } = require("selenium-webdriver");
const faker = require("faker");
const assert = require("assert");

async function login(driver) {
  await driver
    .findElement(By.id("field-username"))
    .sendKeys(process.env.TEST_USERNAME);

  await driver
    .findElement(By.id("field-password"))
    .sendKeys(process.env.TEST_PASSWORD);
}

async function submitStep(driver) {
  await driver
    .findElement(By.css('.form-actions input[type="submit"]'))
    .click();
}

async function deleteApplication(driver) {
  await driver.get(`${process.env.TEST_BASE_URL}/apply/awards-for-all`);
  await driver
    .findElement(By.css('[data-testid="delete-application"]'))
    .click();

  await driver.wait(
    until.titleContains("Are you sure you want to delete your application?")
  );

  await driver
    .findElement(By.css('.form-actions input[type="submit"]'))
    .click();

  await driver.wait(until.titleContains("Your applications"));
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

async function stepProjectCosts(driver) {
  await driver
    .findElement(By.id("projectBudget[0][item]"))
    .sendKeys("Example item 1");

  await driver.findElement(By.id("projectBudget[0][cost]")).sendKeys("1500");

  await driver
    .findElement(By.id("projectBudget[1][item]"))
    .sendKeys("Example item 2");

  await driver.findElement(By.id("projectBudget[1][cost]")).sendKeys("2500");

  const text = await driver
    .findElement(By.css(".ff-budget__total-amount"))
    .getText();

  assert(text === "£4,000", "Cost matches items");

  await driver.findElement(By.id("field-projectTotalCosts")).sendKeys("20000");
}

async function stepBeneficiaries(driver) {
  await driver.findElement(By.id("field-beneficiariesGroupsCheck-2")).click();
}

async function stepOrganisationDetails(driver) {
  await driver
    .findElement(By.id("field-organisationLegalName"))
    .sendKeys(faker.company.companyName());

  await driver
    .findElement(By.css("input[name='organisationStartDate[month]']"))
    .sendKeys(9);
  await driver
    .findElement(By.css("input[name='organisationStartDate[year]']"))
    .sendKeys(1986);

  const summaryEl = await driver.findElement(
    By.css('[data-testid="manual-address"]')
  );

  await summaryEl.click();
  await summaryEl.click();

  await driver
    .findElement(By.id("field-organisationAddress[line1]"))
    .sendKeys(faker.address.streetAddress());

  await driver
    .findElement(By.id("field-organisationAddress[townCity]"))
    .sendKeys(faker.address.city());

  await driver
    .findElement(By.id("field-organisationAddress[county]"))
    .sendKeys(faker.address.county());

  await driver
    .findElement(By.id("field-organisationAddress[postcode]"))
    .sendKeys("B15 1TR");
}

module.exports = async function awardsForAll(driver) {
  await driver.get(`${process.env.TEST_BASE_URL}/apply/awards-for-all/new`);

  await driver
    .manage()
    .window()
    .maximize();

  const cookieButton = await driver.findElement(
    By.css(".cookie-consent__actions .btn")
  );
  await driver.wait(until.elementIsVisible(cookieButton));
  await cookieButton.click();

  await login(driver);
  await submitStep(driver);

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

  await driver.wait(until.titleContains("Project costs"));
  await stepProjectCosts(driver);
  await submitStep(driver);

  // await driver.get(
  //   `${process.env.TEST_BASE_URL}/apply/awards-for-all/beneficiaries/1`
  // );
  await driver.wait(until.titleContains("Specific groups of people"));
  await stepBeneficiaries(driver);
  await submitStep(driver);

  await driver.wait(until.titleContains("Organisation details"));
  await stepOrganisationDetails(driver);
  await submitStep(driver);

  await driver.wait(until.titleContains("Organisation type"));

  // Delete application before ending the test
  await deleteApplication(driver);

  await driver.sleep(2000);
};
