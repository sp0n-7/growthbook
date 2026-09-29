import { Request } from "express";
import { IdTokenCookie, RefreshTokenCookie } from "../../src/util/cookie";

// Backported from upstream growthbook/growthbook#6673 (GHSA-c4m3-8cgx-p88g).
// Only the Cookie.getValue cases are included; the upstream file also tests
// setIdTokenCookie/isIdTokenExpired, which do not exist in this fork.
describe("Cookie.getValue", () => {
  function reqWithCookies(cookies: Record<string, unknown>) {
    return ({ cookies } as unknown) as Request;
  }

  it("returns the value for a normal string cookie", () => {
    const req = reqWithCookies({ AUTH_REFRESH_TOKEN: "abc123" });
    expect(RefreshTokenCookie.getValue(req)).toBe("abc123");
  });

  it("returns an empty string when the cookie is missing", () => {
    expect(RefreshTokenCookie.getValue(reqWithCookies({}))).toBe("");
  });

  // cookie-parser turns `AUTH_REFRESH_TOKEN=j:{"$ne":""}` into an object. If it
  // reached the Mongo filter it would match any refresh token, so it must be
  // dropped here.
  it("drops a JSON-decoded object instead of passing it through", () => {
    const req = reqWithCookies({ AUTH_REFRESH_TOKEN: { $ne: "" } });
    expect(RefreshTokenCookie.getValue(req)).toBe("");
  });

  it("drops JSON-decoded arrays and numbers", () => {
    expect(
      RefreshTokenCookie.getValue(reqWithCookies({ AUTH_REFRESH_TOKEN: [1] }))
    ).toBe("");
    expect(
      RefreshTokenCookie.getValue(reqWithCookies({ AUTH_REFRESH_TOKEN: 42 }))
    ).toBe("");
  });

  it("applies to every cookie, not just the refresh token", () => {
    const req = reqWithCookies({ AUTH_ID_TOKEN: { $ne: "" } });
    expect(IdTokenCookie.getValue(req)).toBe("");
  });
});
