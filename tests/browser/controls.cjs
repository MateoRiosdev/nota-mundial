const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs/promises");
const os = require("node:os");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
    headless: true,
    args: ["--no-sandbox"],
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 1000 },
      timezoneId: "America/Lima",
      reducedMotion: "reduce",
    });
    const p = await context.newPage();
    const errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("dialog", async (d) => {
      errors.push("Unexpected native dialog: " + d.message());
      await d.dismiss();
    });
    const base = process.env.PLANNER_TEST_URL || "http://127.0.0.1:3000";
    const artifacts =
      process.env.PLANNER_ARTIFACTS ||
      path.join(os.tmpdir(), "nota-mundial-browser-tests");
    await fs.mkdir(artifacts, { recursive: true });
    await p.goto(base + "/es");
    await p.getByPlaceholder("Buscar país...").fill("Perú");
    await p.getByRole("button", { name: "Perú 0-20", exact: true }).click();
    const quick = await p
      .locator("summary")
      .filter({ hasText: "Calculadora rápida por país" })
      .boundingBox();
    const tabs = await p.locator(".view-tabs").boundingBox();
    assert(quick.y < tabs.y);
    assert.equal(
      await p
        .getByText("Tu espacio académico", { exact: true })
        .evaluate((el) => getComputedStyle(el).fontWeight),
      "700",
    );
    async function newCourse(name, max) {
      await p.getByRole("button", { name: "Nuevo curso", exact: true }).click();
      const d = p.getByRole("dialog", { name: "Nuevo curso", exact: true });
      assert.equal(
        await d.getByLabel("Máximo", { exact: true }).inputValue(),
        String(max),
      );
      await d.getByLabel("Nombre del curso", { exact: true }).fill(name);
      await d.getByRole("button", { name: "Guardar cambios" }).click();
    }
    await newCourse("Curso Perú", 20);
    await p
      .getByRole("switch", { name: "Guardado automático", exact: true })
      .click();
    await p.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem("nota-mundial:planner:v1")).pages[0]
          .courses.length === 1,
    );
    let data = await p.evaluate(() =>
      JSON.parse(localStorage.getItem("nota-mundial:planner:v1")),
    );
    assert.deepEqual(
      data.pages[0].courses[0].evaluations.map((e) => [e.weight, e.grade]),
      [
        [50, null],
        [50, null],
      ],
    );
    await p.getByPlaceholder("Buscar país...").fill("España");
    await p.getByRole("button", { name: "España 0-10", exact: true }).click();
    await newCourse("Curso España", 10);
    await p
      .getByRole("button", { name: "Editar curso: Curso Perú", exact: true })
      .click();
    let d = p.getByRole("dialog", { name: "Editar curso", exact: true });
    assert.equal(
      await d.getByLabel("Máximo", { exact: true }).inputValue(),
      "20",
    );
    await d.getByRole("button", { name: "Personalizar", exact: true }).click();
    assert.equal(await p.locator("input[type=color]").count(), 0);
    await d.getByLabel("HEX", { exact: true }).fill("#AABBCC");
    await d.getByLabel("Tono", { exact: true }).press("ArrowRight");
    await d.getByLabel("HEX", { exact: true }).fill("#AABBCC");
    await p.screenshot({
      path: path.join(artifacts, "custom-color.png"),
      fullPage: true,
    });
    await d.getByRole("button", { name: "Guardar cambios" }).click();
    await p.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem("nota-mundial:planner:v1")).pages[0]
          .courses[0].color === "#AABBCC",
    );
    await p.getByRole("button", { name: "Curso Perú", exact: true }).click();
    await p.getByRole("button", { name: "Cronograma", exact: true }).click();
    await p
      .getByRole("button", {
        name: "Modificar fechas y evaluación: Evaluación 1",
        exact: true,
      })
      .click();
    d = p.getByRole("dialog", { name: "Editar evaluación", exact: true });
    await d.getByLabel("Inicio", { exact: true }).fill("2026-10-28 09:00");
    await d
      .getByRole("button", { name: "Elegir fecha y hora: Inicio", exact: true })
      .click();
    await d.getByRole("button", { name: "2026-10-31", exact: true }).click();
    await d.getByLabel("Hora: Inicio", { exact: true }).fill("18");
    await d.getByLabel("Minutos: Inicio", { exact: true }).fill("30");
    assert.equal(
      await d.getByLabel("Inicio", { exact: true }).inputValue(),
      "2026-10-31 18:30",
    );
    await d.getByLabel("Entrega", { exact: true }).fill("2026-11-01 19:00");
    assert.equal(await p.locator("input[type=datetime-local]").count(), 0);
    await p.setViewportSize({ width: 390, height: 844 });
    await p.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    await d.locator(".date-picker-panel").scrollIntoViewIfNeeded();
    await p.screenshot({
      path: path.join(artifacts, "custom-datetime-mobile.png"),
      fullPage: false,
    });
    assert.equal(
      await d.evaluate((el) => el.scrollWidth > el.clientWidth),
      false,
    );
    await d.getByRole("button", { name: "Guardar cambios" }).click();
    const url = new URL(
      await p
        .getByRole("link", {
          name: "Añadir a Google Calendar: Evaluación 1",
          exact: true,
        })
        .getAttribute("href"),
    );
    assert.equal(
      url.searchParams.get("dates"),
      "20261031T233000Z/20261102T000000Z",
    );
    await p
      .getByRole("button", {
        name: "Modificar fechas y evaluación: Evaluación 1",
        exact: true,
      })
      .click();
    await p
      .getByRole("dialog", { name: "Editar evaluación", exact: true })
      .getByRole("button", { name: "Eliminar", exact: true })
      .click();
    let confirmation = p.getByRole("dialog", {
      name: "Eliminar evaluación",
      exact: true,
    });
    await confirmation
      .getByRole("button", { name: "Cancelar", exact: true })
      .click();
    assert(
      await p
        .getByRole("dialog", { name: "Editar evaluación", exact: true })
        .isVisible(),
    );
    await p
      .getByRole("dialog", { name: "Editar evaluación", exact: true })
      .getByRole("button", { name: "Eliminar", exact: true })
      .click();
    confirmation = p.getByRole("dialog", {
      name: "Eliminar evaluación",
      exact: true,
    });
    await p.screenshot({
      path: path.join(artifacts, "custom-confirmation.png"),
      fullPage: true,
    });
    await confirmation
      .getByRole("button", { name: "Confirmar", exact: true })
      .click();
    await p.getByRole("dialog").waitFor({ state: "hidden" });
    assert.equal(await p.evaluate(() => document.body.style.overflow), "");
    assert.equal(await p.locator("article").count(), 1);
    await p
      .getByRole("button", { name: "Editar curso: Curso Perú", exact: true })
      .click();
    await p
      .getByRole("dialog", { name: "Editar curso", exact: true })
      .getByRole("button", { name: "Eliminar curso", exact: true })
      .click();
    await p
      .getByRole("dialog", { name: "Eliminar curso", exact: true })
      .getByRole("button", { name: "Cancelar", exact: true })
      .click();
    await p.keyboard.press("Escape");
    await p.getByRole("button", { name: "Calendario", exact: true }).click();
    const week = p.getByRole("combobox", {
      name: "La semana inicia el",
      exact: true,
    });
    await week.click();
    await p.getByRole("option", { name: "Domingo", exact: true }).click();
    assert((await week.innerText()).includes("Domingo"));
    const pages = p.getByRole("combobox", { name: "Mis páginas", exact: true });
    await pages.click();
    assert(
      await p
        .getByRole("listbox", { name: "Mis páginas", exact: true })
        .isVisible(),
    );
    await p.keyboard.press("Escape");
    assert.equal(await p.getByRole("listbox").count(), 0);
    await p
      .getByRole("button", { name: "Calculadora de Notas", exact: true })
      .click();
    const tab = p
      .locator(".view-tab")
      .filter({ hasText: "Calculadora de Notas" });
    const icon = await tab.locator("svg").boundingBox(),
      text = await tab.locator("span").boundingBox();
    assert(text.x - icon.x - icon.width <= 8 && text.x >= icon.x + icon.width);
    await p
      .getByRole("button", { name: "Cambiar a modo oscuro", exact: true })
      .click();
    await p.screenshot({
      path: path.join(artifacts, "controls-mobile-dark.png"),
      fullPage: true,
    });
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    assert.deepEqual(errors, []);
    await context.close();
    console.log(
      "PASS: country-linked defaults, existing-course preservation, custom palette/date/select controls, keyboard Escape, cancel/confirm deletion, UTC export, mobile alignment and dark mode",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
