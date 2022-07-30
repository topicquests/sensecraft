import { binding, given, then, when } from "cucumber-tsflow";

import { By } from "selenium-webdriver";
import { assert } from "chai";
import { ensureSelenium } from "../support/integration";
@binding()
export class RegistrationLoginSteps {

  @given(/A Registration page/)
  public async givenRegistrationPage() {
    try {
      const driver = await ensureSelenium();
      await driver.get("http://localhost:8080/home");
      await driver.sleep(1000);
      await driver.findElement(By.name("registerBtn")).click();
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
  }
  @then("Goes to Signin page {string}")
  public async thenSigninIsCurrentPage(title: string) {
    const driver = await ensureSelenium();
    await driver.sleep(1000);
    assert.equal(await driver.getTitle(), title);
  }

  @given(/A Logon Page/)
  public async givenALogonPage() {
    try {
      const driver = await ensureSelenium();
      await driver.get("http://localhost:8080/home");
      await driver.sleep(1000);
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
  }

  @then("Current page title {string}")
  public async thenDashboardIsCurrentPage(title: string) {
    const driver = await ensureSelenium();
    await driver.sleep(1000);
    assert.equal(await driver.getTitle(), title);
    await driver.sleep(1000);
    await driver.findElement(By.name("logoffBtn")).click();
  }
}
