import { binding, given, then, when } from "cucumber-tsflow";

import { By } from "selenium-webdriver";
import { assert } from "chai";
import { ensureSelenium } from "../support/integration";

let pageName = null;

@binding()
export class SeleniumSteps {
  @given(
    "User signs in with email {string} and password {string}"
  )
  public async givenLogin(email: string, password: string) {
    try {
      const driver = await ensureSelenium();
      await driver.get("http://localhost:8080/home");
      await driver.findElement(By.name("signinBtn")).click();
      await driver.findElement(By.name("email")).sendKeys(email);
      await driver.findElement(By.name("password")).sendKeys(password);

      await driver.findElement(By.name("loginBtn")).click();
    } catch (error) {
      console.log(error);
    }
  }
  @when(/user fills {string} with {string}/)
  public async whenFillFormField(name: string, content: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.name(name)).sendKeys(content);
  }

  @when(/user clicks {string}/)
  public async whenClickSomething(name: string, content: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.name(name)).click();
    await driver.sleep(2000);
  }

  @when(/user opens leftdrawer/)
  public async whenOpenLeftdrawer() {
    const driver = await ensureSelenium();
    await driver.findElement(By.name("leftdrawerBtn")).click();
    await driver.sleep(2000);
  }

  @when(/selects create quest from menu/)
  public async whenOpenSelectCreateQuest() {
    const driver = await ensureSelenium();
    await driver.findElement(By.name("createQuestBtn")).click();
    await driver.sleep(2000);
  }

  @then("Create {string} form is displayed")
  public async thenCreateQuestCurrentPage(title: string) {
    const driver = await ensureSelenium();
    assert.equal(await driver.getTitle(), title);
  }
  @when("Player enters name {string}")
  public async whenPlayerEntersName(name: string) {
    pageName=name;
    const driver = await ensureSelenium();
    await driver.findElement(By.name("name")).sendKeys(name);
  }
  @when("enters description {string}")
  public async playEntersDescription(description: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.className("q-editor__content")).sendKeys(description);
  }
  @when("enters {string} for handle")
  public async playerEntersHandle(handle: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.name("handle")).sendKeys(handle);
  }
  @when("start date of {string}")
  public async playerEntersStartDate(startDate: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.name("startDate")).sendKeys(startDate);
  }
  @when("end date of {string}")
  public async playerEntersEndDate(endDate: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.name("endDate")).sendKeys(endDate);
  }
  @when(/clicks submit button/)
  public async whenClicksSubmit() {
    const driver = await ensureSelenium();
    await driver.findElement(By.name("updateQuestBtn")).click();
    await driver.sleep(2000);
  }
  @then("player goes to quest edit page")
  public async thenQuestEditPage() {
    const driver = await ensureSelenium();
    const title = "Quest edit - " + pageName + " - SenseCraft"
    assert.equal(await driver.getTitle(), title);
    //await driver.findElement(By.name("logoffBtn")).click();
  }

  @given(/A Registration page/)
  public async givenRegistrationPage() {
    try {
      const driver = await ensureSelenium();
      await driver.get("http://localhost:8080/home");
      await driver.findElement(By.name("registerBtn")).click();
      await driver.sleep(2000);
    } catch (error) {
      console.log(error);
    }
  }
  @when("User fills out registration page email as {string}")
  public async whenUserInputsEmail(email: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.name("email")).sendKeys(email);
  }
  @when("name as {string}")
  public async whenUserInputsName(name: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.name("name")).sendKeys(name);
  }
  @when("handle as {string}")
  public async whenUserInputsHandle(handle: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.name("handle")).sendKeys(handle);
  }
  @when("password as {string}")
  public async whenUserInputsPassword(password: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.name("password")).sendKeys(password);
  }
  @when("User clicks Get Started button")
  public async andClicksRegister() {
    const driver = await ensureSelenium();
    await driver.findElement(By.name("registerButton")).click();
    await driver.sleep(2000);
  }
  @then("Goes to Signin page {string}")
  public async thenSigninIsCurrentPage(title: string) {
    const driver = await ensureSelenium();
    assert.equal(await driver.getTitle(), title);
  }

  @given(/A Logon Page/)
  public async givenALogonPage() {
    try {
      const driver = await ensureSelenium();
      await driver.get("http://localhost:8080/home");
        await driver.get("http://localhost:8080/signin");
    } catch (error) {
      console.log(error);
    }
  }

  @when("user logged in using username as {string} and password as {string}")
  public async whenLogin(username: string, password: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.name("email")).sendKeys(username);
    await driver.findElement(By.name("password")).sendKeys(password);
  }
  @when("User clicks login")
  public async andClicksLogin() {
    const driver = await ensureSelenium();
    await driver.findElement(By.name("loginBtn")).click();
    await driver.sleep(2000);
  }

  @then("Current page title {string}")
  public async thenDashboardIsCurrentPage(title: string) {
    const driver = await ensureSelenium();
    assert.equal(await driver.getTitle(), title);
    await driver.findElement(By.name("logoffBtn")).click();
    await driver.sleep(2000);
  }
}
