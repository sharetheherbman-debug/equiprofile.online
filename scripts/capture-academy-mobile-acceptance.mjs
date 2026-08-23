/*
 * Disposable Academy mobile acceptance capture.
 *
 * Launches local Chromium at a genuine 390 × 844 emulated viewport, connects
 * only to academy.localhost:3002 and uses the synthetic acceptance student.
 * No production host, customer data, provider credential, or external service
 * is contacted. Run only while the disposable Academy server is active.
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import WebSocket from "ws";

const cdpPort = 9223;
const outputDir =
  process.env.ACADEMY_ACCEPTANCE_OUTPUT_DIR ??
  "/home/ubuntu/equiprofile.online/docs/academy/acceptance-mobile";
const baseUrl =
  process.env.ACADEMY_ACCEPTANCE_BASE_URL ?? "http://academy.localhost:3002";
const chromiumUserData = "/tmp/equiprofile-academy-mobile-acceptance-chromium";
const width = Number(process.env.ACADEMY_ACCEPTANCE_VIEWPORT_WIDTH ?? 390);
const height = Number(process.env.ACADEMY_ACCEPTANCE_VIEWPORT_HEIGHT ?? 844);
const viewportLabel = `${width}`;

const chrome = spawn(
  "chromium",
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${chromiumUserData}`,
    `--window-size=${width},${height}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

async function getJson(url, options = undefined) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`CDP request failed: ${response.status}`);
  return response.json();
}

async function waitForDebugger() {
  let lastError;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      return await getJson(`http://127.0.0.1:${cdpPort}/json/version`);
    } catch (error) {
      lastError = error;
      await delay(200);
    }
  }
  throw lastError ?? new Error("Chromium DevTools endpoint was unavailable");
}

function connect(url) {
  const ws = new WebSocket(url);
  const pending = new Map();
  const events = [];
  let id = 0;
  const ready = new Promise((resolve, reject) => {
    ws.once("open", resolve);
    ws.once("error", reject);
  });
  ws.on("message", (raw) => {
    const message = JSON.parse(String(raw));
    if (!message.id) {
      if (
        message.method === "Runtime.exceptionThrown" ||
        message.method === "Runtime.consoleAPICalled" ||
        message.method === "Network.loadingFailed" ||
        message.method === "Network.responseReceived"
      ) {
        events.push(message);
      }
      return;
    }
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result ?? {});
  });
  const command = async (method, params = {}) => {
    await ready;
    const requestId = ++id;
    const response = new Promise((resolve, reject) => {
      pending.set(requestId, { resolve, reject });
    });
    ws.send(JSON.stringify({ id: requestId, method, params }));
    return response;
  };
  return { command, events, close: () => ws.close() };
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const version = await waitForDebugger();
  const page = await getJson(
    `http://127.0.0.1:${cdpPort}/json/new?about:blank`,
    {
      method: "PUT",
    },
  );
  const cdp = connect(
    page.webSocketDebuggerUrl ?? version.webSocketDebuggerUrl,
  );
  const { command, events } = cdp;

  try {
    await command("Page.enable");
    await command("Runtime.enable");
    await command("Network.enable");
    await command("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      // CSS breakpoints are tested at an actual 390 px viewport. Avoiding
      // mobile-UA emulation isolates a Chromium headless module-abort quirk
      // observed in the local Vite server; this does not change viewport size.
      mobile: false,
      screenWidth: width,
      screenHeight: height,
    });

    const waitForRenderedRoot = async () => {
      for (let attempt = 0; attempt < 40; attempt += 1) {
        const evaluation = await command("Runtime.evaluate", {
          expression:
            "document.querySelector('#root')?.innerText?.trim().length ?? 0",
          returnByValue: true,
        });
        if (Number(evaluation.result.value) > 20) return true;
        await delay(500);
      }
      return false;
    };

    const capture = async (name) => {
      const rendered = await waitForRenderedRoot();
      const diagnostic = await command("Runtime.evaluate", {
        expression:
          "JSON.stringify({rootHtml: document.querySelector('#root')?.innerHTML ?? null, bodyHtml: document.body.innerHTML.slice(0, 3000), url: location.href, resources: performance.getEntriesByType('resource').map((entry) => entry.name).slice(-100)})",
        returnByValue: true,
      });
      await writeFile(
        `${outputDir}/${name}-diagnostic.json`,
        JSON.stringify(
          {
            rendered,
            dom: JSON.parse(diagnostic.result.value),
            runtimeEvents: events,
          },
          null,
          2,
        ),
      );
      if (!rendered) {
        throw new Error(
          "Academy root did not render within the local acceptance timeout.",
        );
      }
      const screenshot = await command("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
      });
      await writeFile(`${outputDir}/${name}.png`, screenshot.data, "base64");
      const text = await command("Runtime.evaluate", {
        expression:
          "JSON.stringify({ title: document.title, width: window.innerWidth, height: window.innerHeight, text: document.body.innerText.slice(0, 5000), controls: Array.from(document.querySelectorAll('button,a')).map((el) => el.innerText || el.getAttribute('href') || el.getAttribute('aria-label')).filter(Boolean).slice(0, 200) })",
        returnByValue: true,
      });
      await writeFile(
        `${outputDir}/${name}.json`,
        JSON.stringify(JSON.parse(text.result.value), null, 2),
      );
    };

    await command("Page.navigate", { url: `${baseUrl}/academy` });
    await capture(`academy-home-${viewportLabel}`);

    const login = await command("Runtime.evaluate", {
      expression: `(async () => {
        const response = await fetch('/api/auth/login', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'student.acceptance@equiprofile.local', password: 'DisposableAcceptanceOnly!2026' })
        });
        return JSON.stringify({ status: response.status, body: await response.json() });
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    await writeFile(
      `${outputDir}/student-login.json`,
      JSON.stringify(JSON.parse(login.result.value), null, 2),
    );

    const clickControl = async (label) => {
      const result = await command("Runtime.evaluate", {
        expression: `(() => {
          const element = Array.from(document.querySelectorAll('button, a')).find(
            (candidate) => candidate.textContent?.trim() === ${JSON.stringify(label)},
          );
          if (!element) return false;
          element.click();
          return true;
        })()`,
        returnByValue: true,
      });
      if (!result.result.value) {
        throw new Error(`Expected control was not rendered: ${label}`);
      }
    };

    await command("Page.navigate", { url: `${baseUrl}/student-dashboard` });
    await capture(`student-dashboard-${viewportLabel}`);
    await clickControl("Learning Path");
    await capture(`lesson-catalogue-${viewportLabel}`);
    const openFirstPathway = await command("Runtime.evaluate", {
      expression: `(() => {
        const element = Array.from(document.querySelectorAll('button, a')).find(
          (candidate) => candidate.textContent?.includes('Horse Care Foundations'),
        );
        if (!element) return false;
        element.click();
        return true;
      })()`,
      returnByValue: true,
    });
    if (!openFirstPathway.result.value) {
      throw new Error(
        "The Horse Care Foundations pathway control was not rendered.",
      );
    }
    await capture(`pathway-lessons-${viewportLabel}`);
    const openFirstLesson = await command("Runtime.evaluate", {
      expression: `(() => {
        const element = Array.from(document.querySelectorAll('button, a')).find(
          (candidate) => candidate.textContent?.includes('Parts of the Horse'),
        );
        if (!element) return false;
        element.click();
        return true;
      })()`,
      returnByValue: true,
    });
    if (!openFirstLesson.result.value) {
      throw new Error(
        "The Parts of the Horse lesson control was not rendered.",
      );
    }
    await capture(`lesson-detail-${viewportLabel}`);

    console.log(
      JSON.stringify(
        {
          status: "captured",
          viewport: `${width}x${height}`,
          outputDir,
          captures: [
            `academy-home-${viewportLabel}`,
            `student-dashboard-${viewportLabel}`,
            `lesson-catalogue-${viewportLabel}`,
            `pathway-lessons-${viewportLabel}`,
            `lesson-detail-${viewportLabel}`,
          ],
        },
        null,
        2,
      ),
    );
  } finally {
    cdp.close();
    chrome.kill("SIGTERM");
  }
}

main().catch((error) => {
  chrome.kill("SIGTERM");
  console.error(error);
  process.exitCode = 1;
});
