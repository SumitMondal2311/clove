import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const root = path.join(__dirname, "../..");
const distKeysPath = path.join(root, "dist/keys");
const srcKeysPath = path.join(root, "src/keys");

console.log(`Copying Keys dir from ${srcKeysPath} to ${distKeysPath}`);

let copyCmd;
if (process.platform !== "win32") {
    copyCmd = `cp -R "${srcKeysPath}/." "${distKeysPath}"`;
} else {
    copyCmd = `xcopy "${srcKeysPath}\\*" "${distKeysPath}" /E /I /Y`;
}

execSync(copyCmd, { stdio: "inherit" });
console.log("Copied keys successfully");
