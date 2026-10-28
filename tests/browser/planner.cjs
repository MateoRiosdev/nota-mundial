const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const artifacts =
  process.env.PLANNER_ARTIFACTS ||
  path.join(os.tmpdir(), "nota-mundial-browser-tests");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
    headless: true,
    args: ["--no-sandbox"],
  });
  try {
    await fs.mkdir(artifacts, { recursive: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1100 },
      timezoneId: "America/Lima",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto(
      (process.env.PLANNER_TEST_URL || "http://127.0.0.1:3000") + "/es",
    );
    await page
      .getByRole("button", { name: "Crear mi primer curso", exact: true })
      .waitFor();
    async function course(name, code, color) {
      await page
        .getByRole("button", { name: "Nuevo curso", exact: true })
        .click();
      const d = page.getByRole("dialog");
      await page.waitForFunction(() =>
        document.querySelector("dialog")?.matches(":modal"),
      );
      for (let i = 0; i < 18; i++) {
        await page.keyboard.press("Tab");
        assert(
          await page.evaluate(() => !!document.activeElement.closest("dialog")),
        );
      }
      await d.getByLabel("Nombre del curso", { exact: true }).fill(name);
      await d.getByLabel("Código del curso (opcional)").fill(code);
      await d
        .getByRole("button", { name: `Color del curso ${color}`, exact: true })
        .click();
      await d.getByRole("button", { name: "Guardar cambios" }).click();
      await d.waitFor({ state: "hidden" });
    }
    await course("Matemática aplicada", "MAT-101", "#2563EB");
    await course("Desarrollo de soluciones cloud", "CLOUD-3705", "#7C3AED");
    await course("Diseño de interfaces", "UX-203", "#059669");
    async function assessment(
      name,
      weight,
      grade,
      start,
      end,
      courseName = "Matemática aplicada",
    ) {
      await page
        .getByRole("button", { name: "Nueva evaluación", exact: true })
        .click();
      const d = page.getByRole("dialog");
      await d
        .getByLabel("Curso", { exact: true })
        .selectOption({ label: courseName });
      await d.getByLabel("Evaluación", { exact: true }).fill(name);
      await d.getByLabel("Porcentaje (%)").fill(String(weight));
      if (grade !== null) await d.getByLabel("Nota (0–20)").fill(String(grade));
      if (start) {
        await d.getByLabel("Inicio", { exact: true }).fill(start);
        await d.getByLabel("Entrega", { exact: true }).fill(end);
      }
      await d.getByRole("button", { name: "Guardar cambios" }).click();
      await d.waitFor({ state: "hidden" });
    }
    await assessment(
      "Examen parcial",
      50,
      18,
      "2026-10-27T09:00",
      "2026-11-03T23:59",
    );
    await assessment(
      "Proyecto final",
      50,
      null,
      "2026-10-28T10:00",
      "2026-11-05T18:00",
    );
    await assessment(
      "Laboratorio AWS",
      30,
      17,
      "2026-10-29T09:00",
      "2026-10-31T18:00",
      "Desarrollo de soluciones cloud",
    );
    await assessment(
      "Investigación de usuarios",
      100,
      19,
      null,
      null,
      "Diseño de interfaces",
    );
    assert.equal(
      await page.evaluate(() =>
        localStorage.getItem("nota-mundial:planner:v1"),
      ),
      null,
      "opt-in only",
    );
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    let stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("nota-mundial:planner:v1")),
    );
    assert.equal(stored.pages[0].courses.length, 3);
    await page
      .getByRole("switch", { name: "Guardado automático", exact: true })
      .click();
    assert.equal(
      await page.getByRole("switch").getAttribute("aria-checked"),
      "true",
    );
    await page.screenshot({
      path: path.join(artifacts, "planner-calendar.png"),
      fullPage: true,
    });
    await page.getByRole("button", { name: "Cronograma", exact: true }).click();
    await page
      .getByRole("checkbox", { name: "Entregadas: Examen parcial" })
      .check();
    const google = await page
      .getByRole("link", {
        name: "Añadir a Google Calendar: Examen parcial",
        exact: true,
      })
      .getAttribute("href");
    const googleURL = new URL(google);
    assert.equal(
      googleURL.searchParams.get("dates"),
      "20261027T140000Z/20261104T045900Z",
    );
    const downloadPromise = page.waitForEvent("download");
    await page
      .getByRole("button", {
        name: "Descargar archivo .ICS para calendario: Examen parcial",
        exact: true,
      })
      .click();
    const download = await downloadPromise;
    const ics = await fs.readFile(await download.path(), "utf8");
    assert(ics.includes("DTSTART:20261027T140000Z"));
    assert(ics.includes("SUMMARY:Matemática aplicada · Examen parcial"));
    await page.screenshot({
      path: path.join(artifacts, "planner-schedule.png"),
      fullPage: true,
    });
    const card = page.locator("article").filter({
      has: page.getByRole("heading", { name: "Proyecto final", exact: true }),
    });
    await card.getByRole("button", { name: "Nota", exact: true }).click();
    const gradeInput = page.getByRole("spinbutton", {
      name: "Nota: Proyecto final",
      exact: true,
    });
    await gradeInput.fill("18.8");
    await page.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem("nota-mundial:planner:v1")).pages[0]
          .courses[0].evaluations[1].grade === 18.8,
    );
    assert((await page.getByText("18.40", { exact: true }).count()) >= 1);
    assert.equal(
      await gradeInput.evaluate((el) => el === document.activeElement),
      true,
    );
    await page.screenshot({
      path: path.join(artifacts, "planner-calculator.png"),
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Cambiar a modo oscuro", exact: true })
      .click();
    assert(
      await page.locator("html").evaluate((e) => e.classList.contains("dark")),
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );

    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      "mobile calculator overflow",
    );
    await page.screenshot({
      path: path.join(artifacts, "planner-mobile-dark.png"),
      fullPage: true,
    });
    await page.getByRole("button", { name: "Calendario", exact: true }).click();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      "mobile calendar overflow",
    );
    await page.screenshot({
      path: path.join(artifacts, "planner-mobile-calendar.png"),
      fullPage: true,
    });
    await page.reload();
    await page.waitForFunction(
      () =>
        document
          .querySelector("[role=switch]")
          ?.getAttribute("aria-checked") === "true",
    );
    assert.equal(
      await page.getByRole("switch").getAttribute("aria-checked"),
      "true",
    );
    stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("nota-mundial:planner:v1")),
    );
    assert.equal(stored.pages[0].courses[0].evaluations[1].grade, 18.8);
    assert.equal(stored.pages[0].courses[0].evaluations[0].completed, true);
    await page
      .getByRole("button", { name: "Nueva página", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("Nombre de la página")
      .fill("Proyecto personal");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Guardar cambios" })
      .click();
    await page
      .getByRole("button", { name: "Crear mi primer curso", exact: true })
      .waitFor();
    await page.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem("nota-mundial:planner:v1")).pages
          .length === 2,
    );
    await page
      .getByLabel("Mis páginas", { exact: true })
      .selectOption({ label: "Mi semestre" });
    assert((await page.getByRole("button", { name: /MAT-101/ }).count()) === 1);
    await page
      .getByRole("button", {
        name: "Editar curso: Matemática aplicada",
        exact: true,
      })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Color del curso #DB2777", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Guardar cambios" })
      .click();
    await page.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem("nota-mundial:planner:v1")).pages[0]
          .courses[0].color === "#DB2777",
    );
    await page.getByRole("button", { name: "Cronograma", exact: true }).click();
    await page
      .getByRole("button", {
        name: "Modificar fechas y evaluación: Proyecto final",
        exact: true,
      })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("Entrega", { exact: true })
      .fill("2026-11-08T18:00");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Guardar cambios" })
      .click();
    await page.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem("nota-mundial:planner:v1")).pages[0]
          .courses[0].evaluations[1].end === "2026-11-08T23:00:00.000Z",
    );
    await page.getByLabel("Buscar tarea o curso…").fill("AWS");
    assert.equal(await page.locator("article").count(), 1);
    await page.getByLabel("Buscar tarea o curso…").fill("");
    await page.getByRole("button", { name: "Pendientes", exact: true }).click();
    assert.equal(await page.locator("article").count(), 3);
    await page.getByRole("button", { name: "Entregadas", exact: true }).click();
    assert.equal(await page.locator("article").count(), 1);
    await page.getByRole("switch").click();
    await page
      .getByRole("button", { name: "Nueva página", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("Nombre de la página")
      .fill("Sin guardar");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Guardar cambios" })
      .click();
    assert.equal(
      (
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("nota-mundial:planner:v1")),
        )
      ).pages.length,
      2,
    );
    assert(
      await page.getByText("Cambios sin guardar", { exact: true }).isVisible(),
    );
    // Browser-storage failure must be visible and preserve the live edits.
    await page.evaluate(() => {
      Storage.prototype.setItem = function () {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      };
    });
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    assert(
      await page
        .getByRole("alert")
        .filter({ hasText: "No se pudo guardar" })
        .isVisible(),
    );
    assert.equal(
      await page.getByLabel("Mis páginas").inputValue(),
      await page
        .getByLabel("Mis páginas")
        .locator("option")
        .filter({ hasText: "Sin guardar" })
        .getAttribute("value"),
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS: create courses/evaluations, opt-in/manual/autosave, Google Calendar UTC link, ICS download, Note navigation, weighted result, theme, mobile overflow, reload, page isolation, color/date editing, filters, unsaved and storage-failure alerts; no browser errors",
    );
    await context.close();
    const recoveryContext = await browser.newContext();
    await recoveryContext.addInitScript(() =>
      localStorage.setItem("nota-mundial:planner:v1", "{broken"),
    );
    const recovery = await recoveryContext.newPage();
    await recovery.goto(
      (process.env.PLANNER_TEST_URL || "http://127.0.0.1:3000") + "/es",
    );
    await recovery
      .getByRole("alert")
      .filter({ hasText: "No se pudieron leer" })
      .waitFor();
    assert.equal(
      await recovery.evaluate(() =>
        localStorage.getItem("nota-mundial:planner:v1"),
      ),
      "{broken",
    );
    await recoveryContext.close();
    console.log(
      "PASS: modal focus stays contained and corrupt stored data is preserved",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
