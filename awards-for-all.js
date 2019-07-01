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
    .wait(until.elementLocated(By.css('[data-testid="delete-application"]')))
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
    .wait(until.elementLocated(By.id("field-projectName")))
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
  await driver
    .wait(until.elementLocated(By.css("input[value='scotland']")))
    .click();
}

async function stepProjectLocation(driver) {
  await driver
    .wait(
      until.elementLocated(
        By.css("#field-projectLocation > optgroup > option[value=highlands]")
      )
    )
    .click();

  await driver
    .findElement(By.id("field-projectLocationDescription"))
    .sendKeys(faker.lorem.sentence());

  await driver.findElement(By.id("field-projectPostcode")).sendKeys("KW8 6JF");
}

async function stepYourIdea(driver) {
  await driver
    .wait(until.elementLocated(By.id("field-yourIdeaProject")))
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
    .wait(until.elementLocated(By.id("projectBudget[0][item]")))
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
  await driver
    .wait(until.elementLocated(By.id("field-beneficiariesGroupsCheck-2")))
    .click();
}

async function lookupTestAddress(driver) {
  const TEST_POSTCODE = "ID1 1QD";
  await driver
    .findElement(By.css("input[name=postcode-lookup]"))
    .sendKeys(TEST_POSTCODE);

  await driver.findElement(By.css(".address-lookup__field .btn")).click();

  const addressSelect = await driver.wait(
    until.elementLocated(By.id("address-selection"))
  );
  await driver.executeScript("arguments[0].scrollIntoView();", addressSelect);

  await driver.sleep(1500);

  await driver
    .findElement(By.css("#address-selection option:nth-child(2)"))
    .click();
}

async function stepOrganisationDetails(driver) {
  await driver
    .wait(until.elementLocated(By.id("field-organisationLegalName")))
    .sendKeys(faker.company.companyName());

  await driver
    .findElement(By.css("input[name='organisationStartDate[month]']"))
    .sendKeys(9);
  await driver
    .findElement(By.css("input[name='organisationStartDate[year]']"))
    .sendKeys(1986);

  await lookupTestAddress(driver);
}

async function stepOrganisationType(driver) {
  await driver
    .wait(until.elementLocated(By.id("field-organisationType-1")))
    .click();
}

async function stepOrganisationFinances(driver) {
  await driver
    .wait(until.elementLocated(By.css("input[name='accountingYearDate[day]']")))
    .sendKeys("31");

  await driver
    .findElement(By.css("input[name='accountingYearDate[month]']"))
    .sendKeys("03");

  await driver.findElement(By.id("field-totalIncomeYear")).sendKeys("250000");
}

async function stepSeniorContact(driver) {
  await driver
    .wait(until.elementLocated(By.id("field-seniorContactRole-1")))
    .click();

  await driver
    .findElement(By.id("field-seniorContactName-firstName"))
    .sendKeys(faker.name.firstName());
  await driver
    .findElement(By.id("field-seniorContactName-lastName"))
    .sendKeys(faker.name.lastName());

  await driver
    .findElement(By.css("input[name='seniorContactDateOfBirth[day]']"))
    .sendKeys("01");
  await driver
    .findElement(By.css("input[name='seniorContactDateOfBirth[month]']"))
    .sendKeys("02");
  await driver
    .findElement(By.css("input[name='seniorContactDateOfBirth[year]']"))
    .sendKeys("1976");

  await lookupTestAddress(driver);

  await driver
    .findElement(By.id("option-seniorContactAddressHistory-yes"))
    .click();

  await driver
    .findElement(By.id("field-seniorContactEmail"))
    .sendKeys(faker.internet.exampleEmail());

  await driver
    .findElement(By.id("field-seniorContactPhone"))
    .sendKeys(faker.phone.phoneNumber());
}

/**
 * This test suite creates an application against the test site and deletes it at the end of the test
 * Rather than aiming to be a full run through of the form this suite it instead
 * focuses on the more complex interactions that are likely to have cross browser issues.
 * Notably:
 * - Idea questions
 * - Budget question
 * - Address lookup functionality
 *
 * Note: An additional end-to-end run through is handled by Cypress tests in the main app
 */
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

  await stepProjectDetails(driver);
  await submitStep(driver);

  await stepProjectCountry(driver);
  await submitStep(driver);

  await stepProjectLocation(driver);
  await submitStep(driver);

  await stepYourIdea(driver);
  await submitStep(driver);

  await stepProjectCosts(driver);
  await submitStep(driver);

  await stepBeneficiaries(driver);
  await submitStep(driver);

  await stepOrganisationDetails(driver);
  await submitStep(driver);

  await stepOrganisationType(driver);
  await submitStep(driver);

  await stepOrganisationFinances(driver);
  await submitStep(driver);

  await stepSeniorContact(driver);
  await submitStep(driver);

  await driver.wait(until.titleContains("Main contact"));

  // Delete application before ending the test
  // await deleteApplication(driver);

  await driver.sleep(1000);
};
