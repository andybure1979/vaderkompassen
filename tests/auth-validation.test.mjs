import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const auth = await readFile(new URL("../auth.js", import.meta.url), "utf8");

test("Skapa konto validerar e-post och lösenord lokalt före Supabase", () => {
  assert.match(auth, /emailInput\?\.checkValidity\(\)/);
  assert.match(auth, /Ange en giltig e-postadress, exempelvis namn@exempel\.se\./);
  assert.match(auth, /Lösenordet måste innehålla minst 6 tecken\./);
  assert.match(auth, /if \(!credentials\) return;/);
});

test("kontoflöden visar inte råa Supabase-fel", () => {
  assert.doesNotMatch(auth, /setMessage\("authMessage", error\.message/);
  assert.match(auth, /authErrorMessage\(error, "login"\)/);
  assert.match(auth, /authErrorMessage\(error, "signup"\)/);
  assert.match(auth, /authErrorMessage\(error, "reset"\)/);
  assert.match(auth, /authErrorMessage\(error, "oauth"\)/);
});

test("nätverk, rate limit och kända Auth-fel har svenska texter", () => {
  assert.match(auth, /För många försök\. Vänta en stund och försök igen\./);
  assert.match(auth, /Det gick inte att ansluta\. Kontrollera internetanslutningen och försök igen\./);
  assert.match(auth, /Fel e-postadress eller lösenord\./);
  assert.match(auth, /E-postadressen är inte verifierad\./);
});

test("kontoknappar skyddas mot dubbla samtidiga anrop", () => {
  assert.match(auth, /button\.disabled = true/);
  assert.match(auth, /button\.setAttribute\("aria-busy", "true"\)/);
  assert.match(auth, /finally \{ if \(button\)/);
  assert.match(auth, /withBusy\("emailSignup"/);
  assert.match(auth, /withBusy\("emailLogin"/);
  assert.match(auth, /withBusy\("resetPassword"/);
  assert.match(auth, /withBusy\("saveNewPassword"/);
});

test("lösenordsåterställning har separat callback och sparar nytt lösenord", () => {
  assert.match(auth, /flow", "password-recovery"/);
  assert.match(auth, /event === "PASSWORD_RECOVERY"/);
  assert.match(auth, /client\.auth\.updateUser\(\{password\}\)/);
  assert.match(auth, /Lösenorden stämmer inte överens\./);
  assert.match(auth, /signOut\(\{scope:"local"\}\)/);
});
