import { Builder, By, until } from "selenium-webdriver";

const BASE_URL = process.env.UI_BASE_URL || "http://localhost:3000";
const BROWSER = process.env.UI_BROWSER || "chrome";

async function resetSession(driver) {
  await driver.get(`${BASE_URL}/login`);
  await driver.manage().deleteAllCookies();
  await driver.executeScript("window.localStorage.clear();");
  await driver.navigate().refresh();
}

async function clickSafely(driver, element) {
  await driver.executeScript(
    "arguments[0].scrollIntoView({ block: 'center', inline: 'nearest' });",
    element,
  );

  try {
    await element.click();
  } catch {
    await driver.executeScript("arguments[0].click();", element);
  }
}

async function setInputValue(driver, element, value) {
  await driver.executeScript(
    `
      const [input, nextValue] = arguments;
      const descriptor = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      );
      descriptor.set.call(input, nextValue);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    `,
    element,
    value,
  );
}

async function loginPositive(driver) {
  await resetSession(driver);
  await driver.get(`${BASE_URL}/login`);
  const email = await driver.findElement(By.css('input[type="email"]'));
  const password = await driver.findElement(By.css('input[type="password"]'));
  await email.clear();
  await email.sendKeys("organizer@tournament.ru");
  await password.clear();
  await password.sendKeys("Test123!");
  const submitButton = await driver.findElement(By.css('button[type="submit"]'));
  await clickSafely(driver, submitButton);
  await driver.wait(until.urlContains("/dashboard"), 10000);
  await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'Быстрые действия')]")), 10000);
}

async function loginNegative(driver) {
  await resetSession(driver);
  await driver.get(`${BASE_URL}/login`);
  const email = await driver.findElement(By.css('input[type="email"]'));
  const password = await driver.findElement(By.css('input[type="password"]'));
  await email.clear();
  await email.sendKeys("organizer@tournament.ru");
  await password.clear();
  await password.sendKeys("WrongPass");
  const submitButton = await driver.findElement(By.css('button[type="submit"]'));
  await clickSafely(driver, submitButton);
  await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'Неверный логин или пароль')]")), 5000);
}

async function createTournament(driver) {
  await loginPositive(driver);
  await driver.get(`${BASE_URL}/tournaments`);
  const title = await driver.findElement(By.id("title"));
  const startDate = await driver.findElement(By.id("start-date"));
  const endDate = await driver.findElement(By.id("end-date"));
  const groups = await driver.findElement(By.id("groups"));

  await title.clear();
  await title.sendKeys("Тестовый турнир Selenium");
  await setInputValue(driver, startDate, "2026-05-10");
  await setInputValue(driver, endDate, "2026-05-20");
  await setInputValue(driver, groups, "2");

  const submitButton = await driver.findElement(
    By.xpath("//button[@type='submit' and contains(., 'Сохранить турнир')]"),
  );
  await clickSafely(driver, submitButton);

  const successLocator = By.xpath("//*[contains(text(),'успешно создан')]");
  const errorLocator = By.css(".field-error");

  await driver.wait(async () => {
    const success = await driver.findElements(successLocator);
    const errors = await driver.findElements(errorLocator);
    return success.length > 0 || errors.length > 0;
  }, 10000);

  const success = await driver.findElements(successLocator);

  if (success.length > 0) {
    return;
  }

  const errors = await driver.findElements(errorLocator);
  const messages = await Promise.all(errors.map((item) => item.getText()));
  throw new Error(`Tournament form validation failed: ${messages.join("; ")}`);
}

async function runScenario(name, fn) {
  const driver = await new Builder().forBrowser(BROWSER).build();

  try {
    await fn(driver);
    console.log(`PASS: ${name}`);
  } catch (error) {
    console.error(`FAIL: ${name}`);
    console.error(error);
    process.exitCode = 1;
  } finally {
    await driver.quit();
  }
}

async function main() {
  console.log(`Running UI tests against ${BASE_URL} in ${BROWSER}`);
  await runScenario("positive login", loginPositive);
  await runScenario("negative login", loginNegative);
  await runScenario("create tournament", createTournament);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
