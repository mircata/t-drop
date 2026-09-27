import { describe, expect, it } from "vitest";
import { isEmailShaped } from "@/lib/email";

/*
 * These expectations are not opinions about what an email address is — they were read off
 * Payload itself, by pushing each address through `payload.create` against a real database
 * and recording whether it was accepted. `isEmailShaped` exists only to agree with that, so
 * a form can say "invalid address" instead of throwing.
 *
 * `testmail123@213.123` is the address that made `/` answer 500 on 2026-09-22: a numeric
 * top-level domain, which the loose pattern this replaced happily allowed through.
 */
describe("isEmailShaped", () => {
  const accepted = [
    "plain@example.com",
    "mirko.minkov.21@gmail.com",
    "with+plus@gmail.com",
    "dash-name@t-drop.net",
    "under_score@example.com",
    "two.dots@mail.co.uk",
    "test@example.co",
    "test@sub.domain.museum",
    "testmail123@213.abc",
  ];

  const rejected = [
    "testmail123@213.123", // numeric TLD — the 2026-09-22 crash
    "test@example.c", // one-letter TLD
    "test@localhost", // no dot at all
    "test@1.2.3.4", // bare IPv4, which Payload wants bracketed
    "кирилица@example.com", // non-ASCII local part
    "user@кирилица.бг", // non-ASCII domain
    "no-at-sign.example.com",
    "spaces in@example.com",
    "",
  ];

  it.each(accepted)("accepts %j, as Payload does", (email) => {
    expect(isEmailShaped(email)).toBe(true);
  });

  it.each(rejected)("rejects %j, as Payload does", (email) => {
    expect(isEmailShaped(email)).toBe(false);
  });
});
