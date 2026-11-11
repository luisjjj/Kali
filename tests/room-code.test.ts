import assert from "node:assert/strict";
import test from "node:test";
import { formatRoomCode, isRoomCode } from "../lib/room-code";

test("room codes format into three groups", () => {
  assert.equal(formatRoomCode("abcdefghi"), "abc-def-ghi");
  assert.equal(formatRoomCode("ABC DEF GHI"), "abc-def-ghi");
  assert.equal(formatRoomCode("ab"), "ab");
  assert.equal(formatRoomCode(""), "");
});

test("room code formatting drops characters the server rejects", () => {
  assert.equal(formatRoomCode("ab!c-de_f gh1i"), "abc-def-ghi");
});

test("room codes validate in the shared format", () => {
  assert.equal(isRoomCode("abc-def-ghi"), true);
  assert.equal(isRoomCode("  abc-def-ghi  "), true);
  assert.equal(isRoomCode("ABC-DEF-GHI"), false);
  assert.equal(isRoomCode("abc-def"), false);
  assert.equal(isRoomCode("ab1-def-ghi"), false);
});
