import { Request, Response } from "express";

class Cookie {
  private key: string;
  private expires: number;
  constructor(key: string, expires: number) {
    this.key = key;
    this.expires = expires;
  }

  setValue(value: string, req: Request, res: Response, maxAge: number = 0) {
    if (!value) {
      res.clearCookie(this.key, {
        httpOnly: true,
        maxAge: maxAge || this.expires,
        secure: req.secure,
      });
    } else {
      res.cookie(this.key, value, {
        httpOnly: true,
        maxAge: maxAge || this.expires,
        secure: req.secure,
      });
    }

    req.cookies[this.key] = value;
  }

  // cookie-parser JSON-decodes any cookie whose value starts with `j:`, so
  // req.cookies can hold arbitrary attacker-controlled objects. Never hand one
  // to a caller — an object reaching a Mongo filter turns into an operator
  // injection (e.g. `j:{"$ne":""}` matching any refresh token).
  getValue(req: Request): string {
    const value = req.cookies[this.key];
    return typeof value === "string" ? value : "";
  }
}

function days(n: number) {
  return n * 24 * 60 * 60 * 1000;
}
function minutes(n: number) {
  return n * 60 * 1000;
}
export const SSOConnectionIdCookie = new Cookie("SSO_CONNECTION_ID", days(30));
export const RefreshTokenCookie = new Cookie("AUTH_REFRESH_TOKEN", days(30));
export const IdTokenCookie = new Cookie("AUTH_ID_TOKEN", minutes(15));
export const AuthChecksCookie = new Cookie("AUTH_CHECKS", minutes(10));
