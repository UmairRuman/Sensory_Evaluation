import { customAlphabet } from "nanoid";

// Unambiguous alphabet (no 0/O/1/I/l) since joinCode is sometimes read aloud or typed by hand.
const JOIN_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

const publicTokenGen = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 28);
const joinCodeGen = customAlphabet(JOIN_CODE_ALPHABET, 6);

export function generatePublicToken() {
  return publicTokenGen();
}

export function generateJoinCode() {
  return joinCodeGen();
}
