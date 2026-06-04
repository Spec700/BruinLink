/**
 *end-to-end test
 *   npm run test:e2e
 * prints a PASS/FAIL line per check and exits 0 only when everything passes
 */

import {
  generateEditCode,
  hashEditCode,
  isEditCodeFormat,
  slugifyClubName,
  validateRegistrationInput,
  type ClubRegistrationInput,
} from "@/lib/clubRegistration";
import { calculateClubStatus } from "@/lib/clubFreshness";

let passed = 0;
let failed = 0;

function record(name: string, ok: boolean, detail = "") {
  const status = ok ? "PASS" : "FAIL";
  if (ok) passed += 1;
  else failed += 1;
  const suffix = detail ? `  (${detail})` : "";
  console.log(`[${status}] ${name}${suffix}`);
}

function check(name: string, ok: boolean, detail = "") {
  record(name, ok, detail);
}

function eq<T>(name: string, actual: T, expected: T) {
  const ok = actual === expected;
  record(name, ok, ok ? "" : `expected ${String(expected)}, got ${String(actual)}`);
}

// Test data builder

function buildValidInput(
  overrides: Partial<ClubRegistrationInput> = {},
): ClubRegistrationInput {
  return {
    requesterName: "Joe Bruin",
    requesterEmail: "joe.bruin@ucla.edu",
    clubName: "Bruin AI & Robotics!",
    category: "computer science",
    shortDescription: "We build robots and ship AI demos.",
    about: "A student org exploring applied AI and autonomous systems.",
    meetingTime: "Wednesdays 6pm",
    location: {
      name: "Boelter Hall",
      city: "Los Angeles",
      state: "CA",
      country: "USA",
      room: 3400,
    },
    profileImage: null,
    publicContactEmail: "contact@bruinairobotics.org",
    members: 42,
    ...overrides,
  };
}

console.log("Running BruinLink club lifecycle E2E tests...\n" + "=".repeat(70));
console.log("\nStage 1: Registration validation");

const validResult = validateRegistrationInput(buildValidInput());
check("valid submission is accepted", validResult.ok);
if (validResult.ok) {
  eq("valid submission derives the expected slug", validResult.data.slug, "bruin-ai-and-robotics");
  eq("valid submission reports no errors", Object.keys(validResult.errors).length, 0);
}

// Each invalid case must be rejected and flag the offending field
const invalidCases: Array<{
  name: string;
  field: keyof ClubRegistrationInput;
  input: ClubRegistrationInput;
}> = [
  {
    name: "missing requester name is rejected",
    field: "requesterName",
    input: buildValidInput({ requesterName: "   " }),
  },
  {
    name: "malformed requester email is rejected",
    field: "requesterEmail",
    input: buildValidInput({ requesterEmail: "not-an-email" }),
  },
  {
    name: "invalid category is rejected",
    field: "category",
    input: buildValidInput({ category: "underwater-basket-weaving" as never }),
  },
  {
    name: "non-positive member count is rejected",
    field: "members",
    input: buildValidInput({ members: 0 }),
  },
  {
    name: "incomplete meeting location is rejected",
    field: "location",
    input: buildValidInput({ location: { name: "Boelter Hall" } }),
  },
  {
    name: "club name without alphanumerics is rejected",
    field: "clubName",
    input: buildValidInput({ clubName: "!!!" }),
  },
];

for (const testCase of invalidCases) {
  const result = validateRegistrationInput(testCase.input);
  const flaggedRightField = !result.ok && Boolean(result.errors[testCase.field]);
  check(testCase.name, flaggedRightField, result.ok ? "was accepted" : `errors: ${Object.keys(result.errors).join(", ")}`);
}

console.log("\nStage 2: Slug generation");

const slugCases: Array<[string, string]> = [
  ["Bruin AI & Robotics!", "bruin-ai-and-robotics"],
  ["  Hack @ UCLA  ", "hack-ucla"],
  ["Café Society", "caf-society"],
  ["UPPER_case-Mix 123", "upper-case-mix-123"],
  ["--leading and trailing--", "leading-and-trailing"],
];

for (const [name, expected] of slugCases) {
  eq(`slugify "${name}"`, slugifyClubName(name), expected);
}

console.log("\nStage 3: Edit-code issuance and verification");

// match the BL-XXXX-XXXX contract
let allGeneratedValid = true;
const generatedSamples: string[] = [];
for (let i = 0; i < 500; i += 1) {
  const code = generateEditCode();
  generatedSamples.push(code);
  if (!isEditCodeFormat(code)) {
    allGeneratedValid = false;
    break;
  }
}
check("generateEditCode always produces BL-XXXX-XXXX format (500 samples)", allGeneratedValid);
check("generated codes are reasonably unique", new Set(generatedSamples).size > 495, `${new Set(generatedSamples).size}/500 unique`);

const editCode = generateEditCode();
const storedHash = await hashEditCode(editCode); // what approval persists to clubs.edit_code_hash

eq("hashEditCode returns a 64-char SHA-256 hex digest", storedHash.length, 64);
check("hash digest is lowercase hex", /^[0-9a-f]{64}$/.test(storedHash));

// A member later logs in with the same code, possibly lowercased and padded 
// Verification must normalize and match the stored hash exactly
const reEntered = `  ${editCode.toLowerCase()}  `;
const reEnteredHash = await hashEditCode(reEntered);
eq("re-entered code (lowercased + padded) hashes to the stored hash", reEnteredHash, storedHash);

// different code must not collide with the stored hash
let otherCode = generateEditCode();
while (otherCode === editCode) otherCode = generateEditCode();
const otherHash = await hashEditCode(otherCode);
check("a different code yields a different hash", otherHash !== storedHash);

const malformed = ["BL-123-4567", "XX-ABCD-1234", "BL-ABCD-123", "totally wrong", ""];
for (const bad of malformed) {
  check(`malformed code "${bad || "<empty>"}" fails the format check`, !isEditCodeFormat(bad));
  let threw = false;
  try {
    await hashEditCode(bad);
  } catch {
    threw = true;
  }
  check(`hashEditCode rejects malformed code "${bad || "<empty>"}"`, threw);
}

console.log("\nStage 4: Public freshness lifecycle");

const now = new Date("2026-06-01T12:00:00Z");
const daysAgo = (days: number) =>
  new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

eq("just edited -> fresh", calculateClubStatus(now.toISOString(), now), "fresh");
eq("2 days old -> fresh", calculateClubStatus(daysAgo(2), now), "fresh");
eq("10 days old -> steady", calculateClubStatus(daysAgo(10), now), "steady");
eq("30 days old -> needs update", calculateClubStatus(daysAgo(30), now), "needs update");
eq("invalid timestamp -> needs update", calculateClubStatus("not-a-date", now), "needs update");
eq("future timestamp clamps to fresh", calculateClubStatus(daysAgo(-5), now), "fresh");

// Summary

console.log("\n" + "=".repeat(70));
console.log(`Summary: ${passed}/${passed + failed} checks passed.`);

if (failed > 0) {
  process.exit(1);
}
