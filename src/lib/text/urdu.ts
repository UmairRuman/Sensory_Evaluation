// Arabic-script Unicode ranges cover Urdu too. Used to conditionally apply the Nastaliq font/RTL
// styling per rendered remark, since the font itself renders Latin text badly — this can't be a
// blanket font-family swap.
const ARABIC_SCRIPT_RANGE = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;

export function isUrduText(text: string): boolean {
  return ARABIC_SCRIPT_RANGE.test(text);
}
