import { binding, given, then, when } from "cucumber-tsflow";

import { By } from "selenium-webdriver";
import { assert } from "chai";
import { ensureSelenium } from "../support/integration";

let pageName = null;

@binding()
export class CreateQuestSteps {
  @given(
    "User signs in with email {string} and password {string}. Has create quest permission"
  )
  public async givenLogin(email: string, password: string) {
    try {
      const driver = await ensureSelenium();
      await driver.get("http://localhost:8080/home");
      await driver.sleep(1000);
      await driver.findElement(By.name("signinBtn")).click();
      await driver.findElement(By.name("email")).sendKeys(email);
      await driver.findElement(By.name("password")).sendKeys(password);

      await driver.findElement(By.name("loginBtn")).click();
    } catch (error) {
      console.log(error);
    }
  }
  @when(/user opens leftdrawer/)
  public async whenOpenLeftdrawer() {
    const driver = await ensureSelenium();
    await driver.sleep(1000);
    await driver.findElement(By.name("leftdrawerBtn")).click();
  }
  @when(/selects create quest from menu/)
  public async whenOpenSelectCreateQuest() {
    const driver = await ensureSelenium();
    await driver.sleep(1000);
    await driver.findElement(By.name("createQuestBtn")).click();
  }
  @then("Create {string} form is displayed")
  public async thenCreateQuestCurrentPage(title: string) {
    const driver = await ensureSelenium();
    await driver.sleep(1000);
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

  }
  @then("player goes to quest edit page")
  public async thenQuestEditPage() {
    const driver = await ensureSelenium();
    await driver.sleep(1000);
    const title = "Quest edit - " + pageName + " - SenseCraft"
    assert.equal(await driver.getTitle(), title);
    await driver.sleep(1000);
    //await driver.findElement(By.name("logoffBtn")).click();
  }
}
