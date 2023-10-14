import { execSync } from "node:child_process";
import process from "node:process";
import { axiosUtil, WaitingProc } from "./utils";

const processes: WaitingProc[] = [];

export const adminInfo = {
  name: "Admin",
  handle: "admin",
  password: "admin",
  email: "admin@example.com",
};

export const questCreatorInfo = {
  name: "Quest Creator",
  handle: "questCreator",
  password: "password",
  email: "questcreator@example.com",
};

export const guildCreatorInfo = {
  name: "Guild Creator",
  handle: "guildCreator",
  password: "password",
  email: "guildcreator@example.com",
};

async function frontendSetup() {
  execSync("./scripts/db_updater.py -d test init");
  execSync("./scripts/db_updater.py -d test deploy");
  processes.push(new WaitingProc("postgrest", ["postgrest_test.conf"]));
  processes.push(
    new WaitingProc("node", ["dist/qs-server/dispatcher/main.js", "test"])
  );
  processes.push(
    new WaitingProc(
      "MailHog",
      ["-auth-file", "mailhog_test_auth"],
      "Creating API v2"
    )
  );
  await Promise.all(processes.map((wp) => wp.ready()));
  await axiosUtil.call("create_member", adminInfo);
  // auto confirmed and admin because first member
  await axiosUtil.call("create_member", questCreatorInfo);
  execSync(
    "python3 scripts/add_permissions.py -d test -c -u questCreator -p createQuest"
  );
  await axiosUtil.call("create_member", guildCreatorInfo);
  execSync(
    "python3 scripts/add_permissions.py -d test -c -u guildCreator -p createGuild"
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
