import assert from "node:assert/strict";
import test from "node:test";
import {
  formatRoomCode,
  isRoomId,
  looksLikeCompactRoomCode,
  normalizeRoomId,
  slugifyRoomName,
} from "../lib/room-code";

test("room codes format into three groups", () => {
  assert.equal(formatRoomCode("abcdefghi"), "abc-def-ghi");
  assert.equal(formatRoomCode("ABC DEF GHI"), "abc-def-ghi");
  assert.equal(formatRoomCode("ab"), "ab");
  assert.equal(formatRoomCode(""), "");
});

test("room code formatting drops characters the server rejects", () => {
  assert.equal(formatRoomCode("ab!c-de_f gh1i"), "abc-def-ghi");
});

test("custom room names become memorable slugs", () => {
  assert.equal(slugifyRoomName("Study Gang"), "study-gang");
  assert.equal(slugifyRoomName("Café Crew!"), "cafe-crew");
  assert.equal(slugifyRoomName("Ada's Room"), "adas-room");
  assert.equal(slugifyRoomName("  Friday   gossip  "), "friday-gossip");
  assert.equal(slugifyRoomName("..."), "");
  assert.equal(slugifyRoomName("a".repeat(60)), "a".repeat(40));
});

test("room identifiers accept slugs, legacy codes, and pasted links", () => {
  assert.equal(normalizeRoomId("study-gang"), "study-gang");
  assert.equal(normalizeRoomId("Study Gang"), "study-gang");
  assert.equal(normalizeRoomId("abcdefghi"), "abc-def-ghi");
  assert.equal(normalizeRoomId("ABC-DEF-GHI"), "abc-def-ghi");
  assert.equal(normalizeRoomId("  abc-def-ghi  "), "abc-def-ghi");
  assert.equal(normalizeRoomId("kali/study-gang"), "study-gang");
  assert.equal(normalizeRoomId("/m/study-gang"), "study-gang");
  assert.equal(normalizeRoomId("https://kali.app/m/study-gang?name=Ada"), "study-gang");
});

test("room identifiers validate after normalization", () => {
  assert.equal(isRoomId("abc-def-ghi"), true);
  assert.equal(isRoomId("study-gang"), true);
  assert.equal(isRoomId("ab"), true);
  assert.equal(isRoomId("a"), false);
  assert.equal(isRoomId("-study"), false);
  assert.equal(isRoomId("study-"), false);
  assert.equal(isRoomId("study--gang"), false);
  assert.equal(isRoomId("join"), false);
});

test("compact nine-character names are flagged so they are not confused with codes", () => {
  assert.equal(looksLikeCompactRoomCode("studygang"), true);
  assert.equal(looksLikeCompactRoomCode("study-gang"), false);
  assert.equal(looksLikeCompactRoomCode("a".repeat(10)), false);
});
