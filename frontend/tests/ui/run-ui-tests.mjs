import { Builder, By, until } from "selenium-webdriver";

const BASE_URL = process.env.UI_BASE_URL || "http://localhost:3000";
const BROWSER = process.env.UI_BROWSER || "chrome";

async function loginPositive(driver) {
  await driver.get(`${BASE_URL}/login`);
  await driver.findElement(By.css('input[type="email"]')).sendKeys("organizer@tournament.ru");
  await driver.findElement(By.css('input[type="password"]')).sendKeys("Test123!");
  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.wait(until.urlContains("/dashboard"), 5000);
}

async function loginNegative(driver) {
  await driver.get(`${BASE_URL}/login`);
  await driver.findElement(By.css('input[type="email"]')).clear();
  await driver.findElement(By.css('input[type="email"]')).sendKeys("organizer@tournament.ru");
  await driver.findElement(By.css('input[type="password"]')).clear();
  await driver.findElement(By.css('input[type="password"]')).sendKeys("WrongPass");
  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'Неверный логин или пароль')]")), 5000);
}

async function createTournament(driver) {
  await loginPositive(driver);
  await driver.get(`${BASE_URL}/tournaments`);
  await driver.findElement(By.id("title")).sendKeys("Тестовый турнир Selenium");
  await driver.findElement(By.id("start-date")).sendKeys("2026-05-10");
  await driver.findElement(By.id("end-date")).sendKeys("2026-05-20");
  const groups = await driver.findElement(By.id("groups"));
  await groups.clear();
  await groups.sendKeys("2");
  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(),'успешно создан')]")),
    5000,
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
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
