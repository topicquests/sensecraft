import { binding, given, then, when } from "cucumber-tsflow";

import { Builder, By } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { assert } from "chai";

const options = new chrome.Options();

const driver = new Builder()
.setChromeOptions(options)
        .forBrowser("chrome")
        .build();;

@binding()
export class RegistrationLoginSteps {

  @given(/A Registration page/)
  public async givenRegistrationPage() {
    try {
      await driver.get("http://localhost:8080/home");
      await driver.sleep(1000);
      await driver.findElement(By.name("registerBtn")).click();
    } catch (error) {
      console.log(error);
    }
  }
  @when("User fills out registration page email as {string}")
  public async whenUserInputsEmail(email: string) {
    await driver.findElement(By.name("email")).sendKeys(email);
  }
  @when("name as {string}")
  public async whenUserInputsName(name: string) {
    await driver.findElement(By.name("name")).sendKeys(name);
  }
  @when("handle as {string}")
  public async whenUserInputsHandle(handle: string) {
    await driver.findElement(By.name("handle")).sendKeys(handle);
  }
  @when("password as {string}")
  public async whenUserInputsPassword(password: string) {
    await driver.findElement(By.name("password")).sendKeys(password);
  }
  @when("User clicks Get Started button")
  public async andClicksRegister() {
    await driver.findElement(By.name("registerButton")).click();
  }
  @then("Goes to Signin page {string}")
  public async thenSigninIsCurrentPage(title: string) {
    await driver.sleep(1000);
    assert.equal(await driver.getTitle(), title);
  }

  @given(/A Logon Page/)
  public async givenALogonPage() {
    try {
      await driver.get("http://localhost:8080/home");
      await driver.sleep(1000);
      await driver.get("http://localhost:8080/signin");
    } catch (error) {
      console.log(error);
    }
  }

  @when("user logged in using username as {string} and password as {string}")
  public async whenLogin(username: string, password: string) {
    await driver.findElement(By.name("email")).sendKeys(username);
    await driver.findElement(By.name("password")).sendKeys(password);
  }
  @when("User clicks login")
  public async andClicksLogin() {
    await driver.findElement(By.name("loginBtn")).click();
  }

  @then("Current page title {string}")
  public async thenDashboardIsCurrentPage(title: string) {
    await driver.sleep(1000);
    assert.equal(await driver.getTitle(), title);
    await driver.sleep(1000);
    await driver.findElement(By.name("logoffBtn")).click();
  }
}
