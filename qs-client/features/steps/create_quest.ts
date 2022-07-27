import { binding, given, then, when } from "cucumber-tsflow";

import { Builder, By } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { assert } from "chai";

@binding()
export class RegistrationSteps {
  options = new chrome.Options();
  driver = new Builder();

  @given(/A Registration page/)
  public async givenRegistrationPage() {
    try {
      this.driver = await new Builder()
        .setChromeOptions(this.options)
        .forBrowser("chrome")
        .build();
      await this.driver.get("http://localhost:8080/register");
    } catch (error) {
      console.log(error);
    }
  }
  @when("User fills out registration page email as {string}")
  public async whenUserInputsEmail(email: string) {
    await this.driver.findElement(By.name("email")).sendKeys(email);
  }
  @when("name as {string}")
  public async whenUserInputsName(name: string) {
    await this.driver.findElement(By.name("name")).sendKeys(name);
  }
  @when("handle as {string}")
  public async whenUserInputsHandle(handle: string) {
    await this.driver.findElement(By.name("handle")).sendKeys(handle);
  }
  @when("password as {string}")
  public async whenUserInputsPassword(password: string) {
    await this.driver.findElement(By.name("password")).sendKeys(password);
  }
  @when("User clicks Get Started button")
  public async andClicksRegister() {
    await this.driver.findElement(By.name("registerButton")).click();
  }
  @then("Goes to Signin page {string}")
  public async thenSigninIsCurrentPage(title: string) {
    await this.driver.sleep(2000);
    assert.equal(await this.driver.getTitle(), title);
  }

  @given(/A Logon Page/)
  public async givenALogonPage() {
    try {
      this.driver = await new Builder()
        .setChromeOptions(this.options)
        .forBrowser("chrome")
        .build();
      await this.driver.get("http://localhost:8080/signin");
    } catch (error) {
      console.log(error);
    }
  }

  @when("user logged in using username as {string} and password as {string}")
  public async whenLogin(username: string, password: string) {
    await this.driver.findElement(By.name("email")).sendKeys(username);
    await this.driver.findElement(By.name("password")).sendKeys(password);
  }
  @when("User clicks login")
  public async andClicksLogin() {
    await this.driver.findElement(By.name("loginBtn")).click();
  }

  @then("Current page title {string}")
  public async thenDashboardIsCurrentPage(title: string) {
    await this.driver.sleep(2000);
    assert.equal(await this.driver.getTitle(), title);
  }
}
