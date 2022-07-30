import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';
import { Before, AfterAll } from "@cucumber/cucumber";
import { cwd, chdir } from "node:process";
import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";


let selenium: Builder = null;
let backend: ChildProcessWithoutNullStreams = null;
let frontend: ChildProcessWithoutNullStreams = null;

// todo: refactor rather than copy
export async function waitForOutput(proc: ChildProcessWithoutNullStreams, trigger: string): Promise<void> {
  let resolve: (v: any)=>void;
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
  proc.stderr.on('data', wakeup);
  proc.stdout.on('data', wakeup);
  return ready;
}

export async function ensureSelenium(): Builder {
  if (selenium == null) {
    const options = new chrome.Options();
    options.addArguments("--headless");
    selenium = await new Builder()
      .setChromeOptions(options)
      .forBrowser("chrome")
      .build();
  }
  return selenium;
}

async function ensureBackend() {
  if (backend == null) {
    const current = cwd();
    chdir('..');
    chdir('qs-server');
    backend = spawn('npm', ['run', 'test_backend'])
    chdir(current);
    await waitForOutput(backend, 'Ready');
  }
}

async function ensureFrontend() {
  if (frontend == null) {
    frontend = spawn('npm', ['run', 'dev'])
    await waitForOutput(frontend, 'Project is running');
  }
}

async function killSelenium() {
  if (selenium) {
    await selenium.quit()
    selenium = null;
  }
}

async function killBackend() {
  if (backend) {
    backend.kill('SIGINT');
    backend = null;
  }
}

async function killFrontend() {
  if (frontend) {
    frontend.kill('SIGINT');
    frontend = null;
  }
}

Before({ tags: '@integration', timeout: 15000 }, async function (scenario) {
  await Promise.all([
    ensureBackend(),
    ensureFrontend(),
    ensureSelenium()
  ])
  console.log("Ready to run integration scenario")
})

AfterAll(async () => {
  console.log("AfterAll start")
  Promise.all([
    killBackend(),
    killFrontend(),
    killSelenium()
  ])
  console.log("AfterAll end")
})
