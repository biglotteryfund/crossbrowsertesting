"use strict";
const assert = require("assert");
const path = require("path");
const faker = require("faker");
const { By, until, Key } = require("selenium-webdriver");
const remote = require("selenium-webdriver/remote");

async function submitStep(driver) {
  await driver
    .findElement(By.css('.form-actions input[type="submit"]'))
    .click();
}

async function login(driver) {
  await driver
    .findElement(By.id("field-username"))
    .sendKeys(process.env.TEST_USERNAME);

  await driver
    .findElement(By.id("field-password"))
    .sendKeys(process.env.TEST_PASSWORD);

  await submitStep(driver);
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
  await driver.wait(
    until.elementLocated(By.css("label[for='field-yourIdeaProject']"))
  );

  const inputEl = await driver.findElement(By.id("field-yourIdeaProject"));
  await inputEl.sendKeys(faker.lorem.words(51));
  await driver.executeScript("arguments[0].scrollIntoView();", inputEl);

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

  assert(text.trim() === "£4,000", "Cost matches items");

  await driver.findElement(By.id("field-projectTotalCosts")).sendKeys("20000");
}

async function sectionProject(driver) {
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
}

async function sectionBeneficiaries(driver) {
  await driver
    .wait(until.elementLocated(By.id("field-beneficiariesGroupsCheck-2")))
    .click();

  await submitStep(driver);

  await driver
    .wait(until.elementLocated(By.css("input[value='gender']")))
    .click();

  await driver.findElement(By.css("input[value='age']")).click();

  await submitStep(driver);

  await driver
    .wait(until.elementLocated(By.id("field-beneficiariesGroupsGender-2")))
    .click();
  await driver
    .wait(until.elementLocated(By.id("field-beneficiariesGroupsGender-4")))
    .click();

  await submitStep(driver);

  await driver
    .wait(until.elementLocated(By.id("field-beneficiariesGroupsAge-3")))
    .click();

  await submitStep(driver);
}

async function lookupTestAddress(driver, selectItem = 1) {
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
    .findElement(
      By.css(`#address-selection option:nth-child(${selectItem + 1})`)
    )
    .click();

  // trigger the blur event on the form field (eg. to set the address)
  await addressSelect.sendKeys(Key.TAB);
  await driver.findElement(By.css("body")).click();
}

async function sectionOrganisation(driver) {
  await driver
    .wait(until.elementLocated(By.id("field-organisationLegalName")))
    .sendKeys(faker.company.companyName());

  await driver
    .findElement(By.css("input[name='organisationStartDate[month]']"))
    .sendKeys(9);
  await driver
    .findElement(By.css("input[name='organisationStartDate[year]']"))
    .sendKeys(1986);

  await lookupTestAddress(driver, 1);

  await submitStep(driver);

  await driver
    .wait(until.elementLocated(By.id("field-organisationType-1")))
    .click();

  await submitStep(driver);

  await driver
    .wait(until.elementLocated(By.css("input[name='accountingYearDate[day]']")))
    .sendKeys("31");

  await driver
    .findElement(By.css("input[name='accountingYearDate[month]']"))
    .sendKeys("03");

  await driver.findElement(By.id("field-totalIncomeYear")).sendKeys("250000");

  await submitStep(driver);
}

async function sectionSeniorContact(driver) {
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

  await lookupTestAddress(driver, 2);

  await driver
    .findElement(By.id("option-seniorContactAddressHistory-yes"))
    .click();

  await driver
    .findElement(By.id("field-seniorContactEmail"))
    .sendKeys(faker.internet.exampleEmail());

  await driver
    .findElement(By.id("field-seniorContactPhone"))
    .sendKeys("0345 4 10 20 30");

  await submitStep(driver);
}

async function sectionMainContact(driver) {
  await driver
    .wait(until.elementLocated(By.id("field-mainContactName-firstName")))
    .sendKeys(faker.name.firstName());

  await driver
    .findElement(By.id("field-mainContactName-lastName"))
    .sendKeys(faker.name.lastName());

  await driver
    .findElement(By.css("input[name='mainContactDateOfBirth[day]']"))
    .sendKeys("01");
  await driver
    .findElement(By.css("input[name='mainContactDateOfBirth[month]']"))
    .sendKeys("02");
  await driver
    .findElement(By.css("input[name='mainContactDateOfBirth[year]']"))
    .sendKeys("1976");

  await lookupTestAddress(driver, 3);

  await driver
    .findElement(By.id("option-mainContactAddressHistory-yes"))
    .click();

  await driver
    .findElement(By.id("field-mainContactEmail"))
    .sendKeys(faker.internet.exampleEmail());

  await driver
    .findElement(By.id("field-mainContactPhone"))
    .sendKeys("0345 4 10 20 30");

  await submitStep(driver);
}

async function sectionBankDetails(driver) {
  await driver
    .wait(until.elementLocated(By.id("field-bankAccountName")))
    .sendKeys("Example organisation");

  await driver.findElement(By.id("field-bankSortCode")).sendKeys("308087");
  await driver
    .findElement(By.id("field-bankAccountNumber"))
    .sendKeys("25337846");

  await submitStep(driver);

  if (process.env.CI) {
    await driver.setFileDetector(new remote.FileDetector());
  }

  await driver.wait(until.elementLocated(By.id("field-bankStatement")));
  const fileEl = await driver.findElement(By.id("field-bankStatement"));
  await driver.executeScript("arguments[0].scrollIntoView();", fileEl);

  const filePath = path.resolve(__dirname, "./example.pdf");
  await fileEl.sendKeys(filePath);

  await submitStep(driver);
}

async function sectionTerms(driver) {
  const firstEl = await driver.wait(
    until.elementLocated(By.id("field-termsAgreement1-1"))
  );
  await driver.executeScript("arguments[0].scrollIntoView();", firstEl);
  await firstEl.click();

  await driver.findElement(By.id("field-termsAgreement2-1")).click();
  await driver.findElement(By.id("field-termsAgreement3-1")).click();
  await driver.findElement(By.id("field-termsAgreement4-1")).click();

  await driver
    .findElement(By.id("field-termsPersonName"))
    .sendKeys("Example person");
  await driver.findElement(By.id("field-termsPersonPosition")).sendKeys("CEO");

  await submitStep(driver);
}

/**
 * Performs a test application submission (current only in Scotland as that is the first to open)
 * Goes up to the point of completing an application but does not submit.
 * Note: An additional end-to-end run through is handled by Cypress in the main app
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

  await driver.wait(until.titleContains("Summary"));

  await driver
    .wait(
      until.elementLocated(
        By.xpath("//a[contains(text(), 'Start your application')]")
      )
    )
    .click();

  await sectionProject(driver);
  await sectionBeneficiaries(driver);
  await sectionOrganisation(driver);
  await sectionSeniorContact(driver);
  await sectionMainContact(driver);
  await sectionBankDetails(driver);
  await sectionTerms(driver);

  const headingSelector = "h2.submit-actions__title";
  await driver.wait(until.elementLocated(By.css(headingSelector)));
  const text = await driver.findElement(By.css(headingSelector)).getText();
  assert(text.includes("All sections are complete"), "Sections complete");

  await driver.sleep(1000);
};
