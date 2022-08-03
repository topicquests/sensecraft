import { binding, given, then, when } from "cucumber-tsflow";

import { By } from "selenium-webdriver";
import { assert } from "chai";
import { ensureSelenium } from "../support/integration";

@binding()
export class SeleniumSteps {
  @given("User logs in with {string} \\/ {string}")
  public async givenLogin(email: string, password: string) {
    const driver = await ensureSelenium();
    await driver.get("http://localhost:8080/signin");
    await driver.findElement(By.name("signinBtn")).click();
    await driver.findElement(By.name("email")).sendKeys(email);
    await driver.findElement(By.name("password")).sendKeys(password);
    await driver.findElement(By.name("loginBtn")).click();
    await driver.sleep(1000);
  }

  @when(/User fills (\w+) with "(.*)"$/)
  public async whenFillFormField(name: string, content: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.name(name)).sendKeys(content);
  }

  @when('User fills date {word} with {int} days')
  public async whenFillFormFieldRelTime(name: string, days: number) {
    const driver = await ensureSelenium();
    const date = new Date(Date.now() + 24 * 60 * 60 * 1000 * days).toISOString().substring(0, 10);
    await driver.findElement(By.name(name)).sendKeys(date);
  }

  @when(/User fills id (\w+) with "(.*)"$/)
  public async whenFillFormFieldId(name: string, content: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.id(name)).sendKeys(content);
  }

  @when('User fills class {string} with {string}')
  public async whenFillFormFieldClass(name: string, content: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.className(name)).sendKeys(content);
  }

  @when(/User clicks (\w+)$/)
  public async whenClickSomething(name: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.name(name)).click();
    await driver.sleep(1000);
  }

  @when(/User clicks id (\w+)$/)
  public async whenClickSomethingId(name: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.id(name)).click();
    await driver.sleep(1000);
  }

  @when(/User may click id (\w+)$/)
  public async whenMaybeClickSomethingId(name: string) {
    const driver = await ensureSelenium();
    try {
      await driver.findElement(By.id(name)).click();
      await driver.sleep(1000);
    } catch (e) {
      // pass
    }
  }

  @when('User opens leftdrawer')
  public async whenOpenLeftdrawer() {
    return await this.whenClickSomething("leftdrawerBtn")
  }

  @when('User selects create quest from menu')
  public async whenOpenSelectCreateQuest() {
    return await this.whenClickSomething("createQuestBtn")
  }

  @then('Page title is {string}')
  public async thenCreateQuestCurrentPage(title: string) {
    const driver = await ensureSelenium();
    assert.equal(await driver.getTitle(), title);
  }

  @when(/User clicks submit button/)
  public async whenClicksSubmit() {
    const driver = await ensureSelenium();
    // TODO: selenium by type?
    // await driver.findElement(By.type("submit")).click();
    await driver.sleep(1000);
  }

  @then('User is editing quest {string}')
  public async thenQuestEditPage(questName: string) {
    const driver = await ensureSelenium();
    assert.equal(await driver.getTitle(), `Quest edit - ${questName} - SenseCraft`);
  }

  @given('The registration page')
  public async givenRegistrationPage() {
    const driver = await ensureSelenium();
    await driver.get("http://localhost:8080/register");
  }

  @given('The logon Page')
  public async givenALogonPage() {
    const driver = await ensureSelenium();
    await driver.get("http://localhost:8080/signin");
  }
}
