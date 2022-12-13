import { spawn, ChildProcessWithoutNullStreams } from "node:child_process";
import { Before, After, AfterAll } from "@cucumber/cucumber";
import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";

let selenium: Promise<Builder> = null;
let backend: Promise<ChildProcessWithoutNullStreams> = null;
let frontend: Promise<ChildProcessWithoutNullStreams> = null;

// todo: refactor rather than copy
async function waitForOutput(
  proc: ChildProcessWithoutNullStreams,
  trigger: string
): Promise<ChildProcessWithoutNullStreams> {
  let resolve: (v: any) => void;
  const ready = new Promise<void>((rs) => {
    resolve = rs;
  });
  function wakeup(data: any) {
    data = data.toString();
    console.log(data);
    if (data.indexOf(trigger) > -1) {
      setTimeout(resolve, 500);
    }
  }
  proc.stderr.on("data", wakeup);
  proc.stdout.on("data", wakeup);
  await ready;
  return proc;
}

export async function ensureSelenium(): Promise<Builder> {
  if (selenium == null) {
    const options = new chrome.Options();
    if (!process.env.DEBUG_SELENIUM) options.addArguments("--headless");
    selenium = new Builder()
      .setChromeOptions(options)
      .forBrowser("chrome")
      .build();
  }
  return selenium;
}

async function ensureBackend() {
  if (backend == null) {
    const backendProc = spawn(
      "./node_modules/.bin/ts-node",
      ["test/test_backend.ts"],
      {
        cwd: "../qs-server",
      }
    );
    backend = waitForOutput(backendProc, "Ready");
  }
}

async function ensureFrontend() {
  if (frontend == null) {
    const frontendProc = spawn("./node_modules/.bin/quasar", ["dev"], {
      env: { ...process.env, SERVER_URL: "http://localhost:3001" },
    });
    frontend = waitForOutput(frontendProc, "Project is running");
  }
}

async function killSelenium() {
  if (selenium != null) {
    const seleniumP = await selenium;
    await seleniumP.quit();
    selenium = null;
  }
}

async function killProcess(
    process: Promise<ChildProcessWithoutNullStreams>,
    signal: NodeJS.Signals = "SIGTERM") {
  if (process) {
    const processP = await process;
    processP.kill(signal);
    process = null;
  }
}

async function resetDatabase() {
  await killProcess(backend, "SIGHUP");
}

Before({ tags: "@integration", timeout: 45000 }, async function (scenario) {
  ensureBackend();
  ensureFrontend();
  ensureSelenium();
  await Promise.all([backend, frontend, selenium]);
  console.log("Ready to run integration scenario");
});

After({ tags: "@integration", timeout: 510000 }, async function (scenario) {
  if (scenario.result.status == "FAILED" && process.env.DEBUG_SELENIUM) {
    const seleniumP = await selenium;
    await seleniumP.sleep(500000);
  }
  await resetDatabase();
});

AfterAll({ timeout: 20000 }, async () => {
  console.log("AfterAll start");
  await Promise.all([killProcess(backend), killProcess(frontend), killSelenium()]);
  console.log("AfterAll end");
});
