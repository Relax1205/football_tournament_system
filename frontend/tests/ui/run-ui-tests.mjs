import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Builder, By, Key, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import firefox from "selenium-webdriver/firefox.js";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const BASE_URL = process.env.UI_BASE_URL || "http://localhost:3000";
const API_BASE_URL = process.env.UI_API_BASE_URL || "http://localhost:4000/api";
const BROWSER = process.env.UI_BROWSER || "chrome";
const HEADLESS = process.env.UI_HEADLESS !== "0";
const DEMO_USERS = {
  coach: { email: "coach@tournament.ru", password: "Test123!" },
  coach2: { email: "coach2@team.ru", password: "Test123!" },
  fan: { email: "fan@tournament.ru", password: "Test123!" },
  organizer: { email: "org@tournament.ru", password: "Test123!" },
  referee: { email: "referee@tournament.ru", password: "Test123!" },
};

async function resetSession(driver) {
  await driver.get(`${BASE_URL}/login`);
  await driver.manage().deleteAllCookies();
  await driver.executeScript("window.localStorage.clear();");
  await driver.navigate().refresh();
}

async function apiRequest(pathname, { body, method = "GET", token } = {}) {
  const response = await fetch(`${API_BASE_URL}${pathname}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json();
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error || `API request failed: ${method} ${pathname}`);
  }

  return payload.data;
}

async function apiLogin(role) {
  const user = DEMO_USERS[role];
  const result = await apiRequest("/auth/login", {
    method: "POST",
    body: {
      email: user.email,
      password: user.password,
    },
  });

  return result.token;
}

async function createMatchFixture() {
  const organizerToken = await apiLogin("organizer");
  const coachToken = await apiLogin("coach");
  const coach2Token = await apiLogin("coach2");
  const uniqueSuffix = Date.now().toString().slice(-6);
  const homeTeamName = `UI Home ${uniqueSuffix}`;
  const awayTeamName = `UI Away ${uniqueSuffix}`;
  const tournament = await apiRequest("/tournaments", {
    method: "POST",
    token: organizerToken,
    body: {
      name: `UI Match Fixture ${uniqueSuffix}`,
      format: "GROUPS",
      groups: 1,
      status: "REGISTRATION_OPEN",
      startDate: "2026-06-01T12:00:00.000Z",
      endDate: "2026-06-10T12:00:00.000Z",
    },
  });

  const applicationOne = await apiRequest("/applications", {
    method: "POST",
    token: coachToken,
    body: {
      tournamentId: tournament.id,
      teamName: homeTeamName,
      city: "Moscow",
      coachName: "Coach One",
      playersCount: 18,
    },
  });
  const applicationTwo = await apiRequest("/applications", {
    method: "POST",
    token: coach2Token,
    body: {
      tournamentId: tournament.id,
      teamName: awayTeamName,
      city: "Kazan",
      coachName: "Coach Two",
      playersCount: 18,
    },
  });

  await apiRequest(`/applications/${applicationOne.id}/status`, {
    method: "PATCH",
    token: organizerToken,
    body: { status: "APPROVED" },
  });
  await apiRequest(`/applications/${applicationTwo.id}/status`, {
    method: "PATCH",
    token: organizerToken,
    body: { status: "APPROVED" },
  });

  const teams = await apiRequest(
    `/teams?tournamentId=${encodeURIComponent(tournament.id)}`,
    { token: organizerToken },
  );
  const homeTeam = teams.find((team) => team.name === homeTeamName);
  const awayTeam = teams.find((team) => team.name === awayTeamName);

  if (!homeTeam || !awayTeam) {
    throw new Error("Unable to provision teams for the UI match fixture");
  }

  await apiRequest(`/teams/${homeTeam.id}/players`, {
    method: "POST",
    token: coachToken,
    body: {
      firstName: "Ivan",
      lastName: "Forward",
      number: 9,
    },
  });
  await apiRequest(`/teams/${awayTeam.id}/players`, {
    method: "POST",
    token: coach2Token,
    body: {
      firstName: "Pavel",
      lastName: "Keeper",
      number: 1,
    },
  });

  await apiRequest("/schedule/generate", {
    method: "POST",
    token: organizerToken,
    body: {
      tournamentId: tournament.id,
      startDate: "2026-06-02T12:00:00.000Z",
      daysBetweenRounds: 3,
    },
  });

  return { awayTeamName, homeTeamName, tournamentId: tournament.id };
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

async function fillInput(driver, element, value) {
  await clickSafely(driver, element);

  try {
    await element.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
    await element.sendKeys(value);
  } catch {
    await setInputValue(driver, element, value);
  }

  const currentValue = await element.getAttribute("value");
  if (currentValue !== value) {
    await setInputValue(driver, element, value);
  }
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

async function expectNoElements(driver, locator) {
  const elements = await driver.findElements(locator);
  if (elements.length > 0) {
    throw new Error(`Unexpected element found for locator: ${locator}`);
  }
}

function findBinary(rootDir, fileName) {
  if (!rootDir || !fs.existsSync(rootDir)) {
    return null;
  }

  const stack = [rootDir];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);

      if (entry.isFile() && entry.name.toLowerCase() === fileName.toLowerCase()) {
        return fullPath;
      }

      if (entry.isDirectory()) {
        stack.push(fullPath);
      }
    }
  }

  return null;
}

async function buildDriver() {
  const builder = new Builder().forBrowser(BROWSER);

  if (BROWSER === "firefox") {
    const options = new firefox.Options();
    if (HEADLESS) {
      options.addArguments("-headless");
    }
    builder.setFirefoxOptions(options);
  } else {
    const options = new chrome.Options();
    const chromeBinary =
      process.env.UI_CHROME_BINARY ||
      findBinary(path.join(PROJECT_ROOT, "chrome"), "chrome.exe") ||
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const chromedriverBinary =
      process.env.UI_CHROMEDRIVER_PATH ||
      findBinary(path.join(PROJECT_ROOT, "chromedriver"), "chromedriver.exe");

    if (chromeBinary && fs.existsSync(chromeBinary)) {
      options.setChromeBinaryPath(chromeBinary);
    }

    if (HEADLESS) {
      options.addArguments("--headless=new", "--disable-gpu", "--window-size=1440,1200");
    }

    options.addArguments("--no-sandbox", "--disable-dev-shm-usage");
    builder.setChromeOptions(options);

    if (chromedriverBinary && fs.existsSync(chromedriverBinary)) {
      builder.setChromeService(new chrome.ServiceBuilder(chromedriverBinary));
    }
  }

  return builder.build();
}

async function selectEditableMatch(driver, fixture) {
  const matchSelect = await driver.findElement(By.id("match-id"));
  await driver.wait(async () => {
    const optionCount = await driver.executeScript(
      `
        const [select, home, away] = arguments;
        return Array.from(select.options).filter(
          (item) => item.text.includes(home) && item.text.includes(away),
        ).length;
      `,
      matchSelect,
      fixture.homeTeamName,
      fixture.awayTeamName,
    );
    return Number(optionCount) > 0;
  }, 10000);

  const matchValue = await driver.executeScript(
    `
      const [select, home, away] = arguments;
      const option = Array.from(select.options).find(
        (item) => item.text.includes(home) && item.text.includes(away),
      );
      return option ? option.value : "";
    `,
    matchSelect,
    fixture.homeTeamName,
    fixture.awayTeamName,
  );

  if (!matchValue) {
    throw new Error(
      `Editable match option was not found for "${fixture.homeTeamName}" / "${fixture.awayTeamName}"`,
    );
  }

  await setSelectValue(driver, matchSelect, matchValue);
  await driver.sleep(300);

  const playerSelect = await driver.findElement(By.id("event-player"));
  await driver.wait(async () => {
    const optionsCount = await driver.executeScript(
      "return arguments[0].options.length;",
      playerSelect,
    );
    return Number(optionsCount) > 0;
  }, 5000);

  const playerValue = await driver.executeScript(
    "return arguments[0].options[0] ? arguments[0].options[0].value : '';",
    playerSelect,
  );

  if (playerValue) {
    await setSelectValue(driver, playerSelect, playerValue);
  }
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
  await email.sendKeys("org@tournament.ru");
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
  const uniqueSuffix = Date.now().toString().slice(-6);

  const tournamentName = `Тестовый турнир Selenium ${uniqueSuffix}`;
  const submitButton = await driver.findElement(
    By.xpath("//button[@type='submit' and contains(., 'Создать турнир')]"),
  );
  const errorLocator = By.css(".field-error");
  const fillStrategies = [
    async () => {
      await setInputValue(driver, title, tournamentName);
      await setInputValue(driver, startDate, "2026-05-10");
      await setInputValue(driver, endDate, "2026-05-20");
      await setInputValue(driver, groups, "2");
    },
    async () => {
      await fillInput(driver, title, tournamentName);
      await fillInput(driver, startDate, "2026-05-10");
      await fillInput(driver, endDate, "2026-05-20");
      await fillInput(driver, groups, "2");
    },
  ];

  for (const applyValues of fillStrategies) {
    await applyValues();
    await driver.sleep(300);
    await clickSafely(driver, submitButton);

    const settled = await driver
      .wait(async () => {
        const pageText = await driver.findElement(By.css("body")).getText();
        const errors = await driver.findElements(errorLocator);
        return pageText.includes(tournamentName) || errors.length > 0;
      }, 5000)
      .then(() => true)
      .catch(() => false);

    if (!settled) {
      continue;
    }

    const pageText = await driver.findElement(By.css("body")).getText();
    if (pageText.includes(tournamentName)) {
      return;
    }

    const errors = await driver.findElements(errorLocator);
    const messages = await Promise.all(errors.map((item) => item.getText()));
    throw new Error(`Tournament form validation failed: ${messages.join("; ")}`);
  }

  throw new Error("Tournament form did not create a record and showed no validation errors");
}

async function enterMatchResult(driver) {
  const fixture = await createMatchFixture();
  await loginAs(driver, "referee");
  await driver.get(`${BASE_URL}/matches`);
  await selectEditableMatch(driver, fixture);

  const homeScore = await driver.findElement(By.id("home-score"));
  const awayScore = await driver.findElement(By.id("away-score"));
  const eventMinute = await driver.findElement(By.id("event-minute"));
  const comment = await driver.findElement(By.id("comment"));
  const status = await driver.findElement(By.id("status"));

  await fillInput(driver, homeScore, "2");
  await fillInput(driver, awayScore, "1");
  await fillInput(driver, eventMinute, "57");
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

async function validateGoalMinute(driver) {
  const fixture = await createMatchFixture();
  await loginAs(driver, "referee");
  await driver.get(`${BASE_URL}/matches`);
  await selectEditableMatch(driver, fixture);

  const homeScore = await driver.findElement(By.id("home-score"));
  const awayScore = await driver.findElement(By.id("away-score"));
  const eventMinute = await driver.findElement(By.id("event-minute"));
  const comment = await driver.findElement(By.id("comment"));
  const submitButton = await driver.findElement(
    By.xpath("//button[@type='submit' and contains(., 'Сохранить результат')]"),
  );

  await fillInput(driver, homeScore, "1");
  await fillInput(driver, awayScore, "0");
  await fillInput(driver, eventMinute, "150");
  await comment.clear();
  await comment.sendKeys("Проверка валидации минуты");
  await clickSafely(driver, submitButton);

  await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(),'Минута гола должна быть от 1 до 120')]")),
    5000,
  );
}

async function verifyRbacForFan(driver) {
  await loginAs(driver, "fan");
  await driver.get(`${BASE_URL}/matches`);
  await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(),'Режим просмотра')]")),
    10000,
  );

  await driver.wait(
    until.elementLocated(By.xpath("//a[contains(., 'Сгенерировать протокол')]")),
    10000,
  );
  await expectNoElements(driver, By.id("home-score"));
  await expectNoElements(
    driver,
    By.xpath("//button[@type='submit' and contains(., 'Сохранить результат')]"),
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
  await fillInput(driver, playersCount, "18");
  await setSelectValue(driver, tournament, await tournament.getAttribute("value"));

  const submitButton = await driver.findElement(
    By.xpath("//button[@type='submit' and contains(., 'Подать заявку')]"),
  );
  await clickSafely(driver, submitButton);
  await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(),'отправлена организатору')]")),
    10000,
  );
}

async function verifyExportsAndLocalization(driver) {
  await loginAs(driver, "organizer");
  await driver.get(`${BASE_URL}/matches`);
  await driver.wait(
    until.elementLocated(By.xpath("//a[contains(., 'Сгенерировать протокол')]")),
    10000,
  );

  const pageText = await driver.findElement(By.css("body")).getText();
  if (!/\b\d{2}\.\d{2}\.\d{4}\b/.test(pageText)) {
    throw new Error("Localized date in format ДД.ММ.ГГГГ was not found on the page");
  }

  await driver.get(`${BASE_URL}/standings`);
  await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(),'Экспорт в Excel')]")),
    10000,
  );
}

async function runScenario(name, fn) {
  const driver = await buildDriver();

  try {
    await fn(driver);
    console.log(`PASS: ${name}`);
  } catch (error) {
    console.error(`FAIL: ${name}`);
    try {
      const pageText = await driver.findElement(By.css("body")).getText();
      console.error(pageText.slice(0, 2000));
    } catch {
      console.error("Unable to capture page text");
    }
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
  await runScenario("validate goal minute", validateGoalMinute);
  await runScenario("verify fan read-only access", verifyRbacForFan);
  await runScenario("submit application as coach", submitApplicationAsCoach);
  await runScenario("verify exports and localization", verifyExportsAndLocalization);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
