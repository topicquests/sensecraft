import { binding, given, then, when } from "cucumber-tsflow";
import axios from "axios";
import { decode } from "libqp";

import { By } from "selenium-webdriver";
import { NoSuchElementError } from "selenium-webdriver/lib/error";
import { assert } from "chai";
import { ensureSelenium } from "../support/integration";

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
@binding()
export class SeleniumSteps {
  @given("User logs in with {string} \\/ {string}")
  public async givenLogin(email: string, password: string) {
    const driver = await ensureSelenium();
    await driver.get("http://localhost:8080/signin");
    await driver.findElement(By.name("signinBtn")).click();
    await driver.findElement(By.name("email")).sendKeys(email);
    await driver.findElement(By.name("pass")).sendKeys(password);
    await driver.findElement(By.name("loginBtn")).click();
    await driver.sleep(1500);
  }

  @when(/User fills (\w+) with "(.*)"$/)
  public async whenFillFormField(name: string, content: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.name(name)).sendKeys(content);
  }

  @when("User fills date {word} with {int} days")
  public async whenFillFormFieldRelTime(name: string, days: number) {
    const driver = await ensureSelenium();
    const date = new Date(Date.now() + 24 * 60 * 60 * 1000 * days)
      .toISOString()
      .substring(0, 10);
    await driver.findElement(By.name(name)).sendKeys(date);
  }

  @when(/User fills id (\w+) with "(.*)"$/)
  public async whenFillFormFieldId(name: string, content: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.id(name)).sendKeys(content);
  }

  @when("User fills class {string} with {string}")
  public async whenFillFormFieldClass(name: string, content: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.className(name)).sendKeys(content);
  }

  @when(/User clicks (\w+)$/)
  public async whenClickSomething(name: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.name(name)).click();
    await driver.sleep(1500);
  }

  @when(/User clicks id (\w+)$/)
  public async whenClickSomethingId(name: string) {
    const driver = await ensureSelenium();
    await driver.findElement(By.id(name)).click();
    await driver.sleep(1500);
  }

  @when(/User may click id (\w+)$/)
  public async whenMaybeClickSomethingId(name: string) {
    const driver = await ensureSelenium();
    try {
      await driver.findElement(By.id(name)).click();
      await driver.sleep(1500);
    } catch (e) {
      // pass
    }
  }

  @when("User opens leftdrawer")
  public async whenOpenLeftdrawer() {
    return await this.whenClickSomething("leftdrawerBtn");
  }

  @when("User selects create quest from menu")
  public async whenOpenSelectCreateQuest() {
    return await this.whenClickSomething("createQuestBtn");
  }

  @then("Page title is {string}")
  public async thenCreateQuestCurrentPage(title: string) {
    const driver = await ensureSelenium();
    assert.equal(await driver.getTitle(), title);
  }

  @when(/User clicks submit button/)
  public async whenClicksSubmit() {
    const driver = await ensureSelenium();
    // TODO: selenium by type?
    // await driver.findElement(By.type("submit")).click();
    await driver.sleep(1500);
  }

  @then("User is editing quest {string}")
  public async thenQuestEditPage(questName: string) {
    const driver = await ensureSelenium();
    assert.equal(
      await driver.getTitle(),
      `Quest edit - ${questName} - SenseCraft`
    );
  }

  @given("The registration page")
  public async givenRegistrationPage() {
    const driver = await ensureSelenium();
    await driver.get("http://localhost:8080/register");
  }

  @given("The logon Page")
  public async givenALogonPage() {
    const driver = await ensureSelenium();
    await driver.get("http://localhost:8080/signin");
  }

  @given("The logoff page")
  public async givenALogoffPage() {
    const driver = await ensureSelenium();
    await driver.get("http://localhost:8080/signoff");
  }

  @then(/The user is (not )?logged in/)
  public async thenLoggedInStatus(negation: string) {
    const expected = !(negation?.length > 0);
    const driver = await ensureSelenium();
    try {
      await driver.findElement(By.className("member"));
      assert.isTrue(expected);
    } catch (e) {
      if (e instanceof NoSuchElementError) assert.isFalse(expected);
      else throw e;
    }
  }

  @then(/User (\S+) gets email with token/)
  public async getEmailWithToken(member_email: string) {
    await delay(500);
    const mailhog_auth = { Authorization: "Basic dGVzdDp0ZXN0" }; // test:test
    const messageSearch = await axios.get(
      "http://localhost:8025/api/v2/search",
      {
        params: {
          kind: "to",
          query: member_email,
        },
        headers: mailhog_auth,
      }
    );
    assert.notEqual(messageSearch.data.total, 0);
    const email = messageSearch.data.items[0];
    const textParts = email.MIME.Parts.filter(
      (x) =>
        ((x.Headers || {})["Content-Type"] || [""])[0].indexOf("text/plain") >=
        0
    );
    assert.equal(textParts.length, 1);
    let text: string = textParts[0].Body;
    if (textParts[0].Headers["Content-Transfer-Encoding"] == "quoted-printable")
      text = decode(text).toString();
    const token_search = /(http:.*)/.exec(text);
    assert(token_search);
    const token = token_search[1];
    (this as any).emailTokenLink = token;
  }

  @given("User has token")
  public hasToken() {
    assert.isDefined((this as any).emailTokenLink);
  }

  @when("User clicks on token link")
  public async useTokenLink() {
    const driver = await ensureSelenium();
    const url: string = (this as any).emailTokenLink;
    await driver.get(url);
    // wait for the forwarding
    await delay(300);
  }
}
