import { exec, execSync } from "node:child_process";
import process from "node:process";
import { WaitingProc } from "./utils";

const processes: WaitingProc[] = [];

async function frontendSetup() {
  execSync("./scripts/initial_setup.py --test sensecraft_test --no-create-development --no-create-production --dropdb");
  execSync("./scripts/db_updater.py -d test init");
  execSync("./scripts/db_updater.py -d test deploy");
  processes.push(new WaitingProc("postgrest", ["postgrest_test.conf"]));
  processes.push(
    new WaitingProc("node", ["dist/server/dispatcher/main.js", "test"])
  );
  processes.push(
    new WaitingProc(
      "MailHog",
      ["-auth-file", "mailhog_test_auth"],
      "Creating API v2"
    )
  );
  console.log("Ready");
}

async function frontendTeardown() {
  await Promise.all(processes.map((wp) => wp.signal("SIGTERM")));
  if (!process.env.NOREVERT) execSync("./scripts/db_updater.py -d test revert");
}

process.on("SIGHUP", () => {
  console.log("SIGHUP");
  execSync("./scripts/db_updater.py -d test run_sql -f scripts/truncate.sql");
  // TODO: Empty mailhog messages
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM");
  await frontendTeardown();
  console.log("done");
});

process.on("SIGINT", async () => {
  console.log("SIGINT");
  await frontendTeardown();
  console.log("done");
});

frontendSetup();
