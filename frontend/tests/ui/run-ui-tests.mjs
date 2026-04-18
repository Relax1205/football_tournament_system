import { Builder, By, until } from "selenium-webdriver";

const BASE_URL = process.env.UI_BASE_URL || "http://localhost:3000";
const BROWSER = process.env.UI_BROWSER || "chrome";
const DEMO_USERS = {
  coach: { email: "coach@tournament.ru", password: "TestPass123!" },
  fan: { email: "fan@tournament.ru", password: "TestPass123!" },
  organizer: { email: "organizer@tournament.ru", password: "TestPass123!" },
  referee: { email: "referee@tournament.ru", password: "TestPass123!" },
};

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

async function setSelectValue(driver, element, value) {
  await driver.executeScript(
    `
      const [select, nextValue] = arguments;
      const descriptor = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        "value",
      );
      descriptor.set.call(select, nextValue);
      select.dispatchEvent(new Event("input", { bubbles: true }));
      select.dispatchEvent(new Event("change", { bubbles: true }));
    `,
    element,
    value,
  );
}

async function loginAs(driver, role) {
  const credentials = DEMO_USERS[role];

  await resetSession(driver);
  await driver.get(`${BASE_URL}/login`);
  const email = await driver.findElement(By.css('input[type="email"]'));
  const password = await driver.findElement(By.css('input[type="password"]'));
  await email.clear();
  await email.sendKeys(credentials.email);
  await password.clear();
  await password.sendKeys(credentials.password);
  const submitButton = await driver.findElement(By.css('button[type="submit"]'));
  await clickSafely(driver, submitButton);
  await driver.wait(until.urlContains("/dashboard"), 10000);
  await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'Быстрые действия')]")), 10000);
}

async function loginPositive(driver) {
  await loginAs(driver, "organizer");
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

async function enterMatchResult(driver) {
  await loginAs(driver, "referee");
  await driver.get(`${BASE_URL}/matches`);

  const homeScore = await driver.findElement(By.id("home-score"));
  const awayScore = await driver.findElement(By.id("away-score"));
  const eventMinute = await driver.findElement(By.id("event-minute"));
  const comment = await driver.findElement(By.id("comment"));
  const status = await driver.findElement(By.id("status"));

  await setInputValue(driver, homeScore, "2");
  await setInputValue(driver, awayScore, "1");
  await setInputValue(driver, eventMinute, "57");
  await comment.clear();
  await comment.sendKeys("Результат проверен судьей");
  await setSelectValue(driver, status, "Требует подтверждения");

  const submitButton = await driver.findElement(
    By.xpath("//button[@type='submit' and contains(., 'Сохранить результат')]"),
  );
  await clickSafely(driver, submitButton);
  await driver.wait(
    until.elementLocated(
      By.xpath("//*[contains(text(),'Результат сохранён и отправлен организатору')]"),
    ),
    10000,
  );
}

async function verifyRbacForFan(driver) {
  await loginAs(driver, "fan");
  await driver.get(`${BASE_URL}/matches`);
  await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(),'Недостаточно прав')]")),
    10000,
  );
}

async function submitApplicationAsCoach(driver) {
  await loginAs(driver, "coach");
  await driver.get(`${BASE_URL}/teams`);

  const teamName = await driver.findElement(By.id("team-name"));
  const city = await driver.findElement(By.id("city"));
  const coach = await driver.findElement(By.id("coach"));
  const playersCount = await driver.findElement(By.id("players-count"));
  const tournament = await driver.findElement(By.id("tournament-name"));

  await teamName.clear();
  await teamName.sendKeys("Северный Легион");
  await city.clear();
  await city.sendKeys("Москва");
  await coach.clear();
  await coach.sendKeys("Иван Петров");
  await setInputValue(driver, playersCount, "18");
  await setSelectValue(driver, tournament, await tournament.getAttribute("value"));

  const submitButton = await driver.findElement(
    By.xpath("//button[@type='submit' and contains(., 'Отправить заявку')]"),
  );
  await clickSafely(driver, submitButton);
  await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(),'отправлена организатору')]")),
    10000,
  );
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
  await runScenario("enter match result as referee", enterMatchResult);
  await runScenario("verify rbac for fan", verifyRbacForFan);
  await runScenario("submit application as coach", submitApplicationAsCoach);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
