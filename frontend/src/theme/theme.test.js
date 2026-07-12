import { describe, expect, it } from "vitest";

import theme from "./index";

describe("prototype theme", () => {
  it("uses the expected brand palette and typography", () => {
    expect(theme.palette.primary.main).toBe("#0f8b87");
    expect(theme.palette.background.default).toBe("#f5f7fb");
    expect(theme.typography.fontFamily).toContain("IBM Plex Mono");
  });
});
