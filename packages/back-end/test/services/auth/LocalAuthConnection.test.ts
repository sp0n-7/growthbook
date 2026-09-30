import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { LocalAuthConnection } from "../../../src/services/auth/LocalAuthConnection";
import { JWT_SECRET } from "../../../src/util/secrets";

// Covers the express-jwt v8 / jsonwebtoken v9 upgrade (upstream #5236): the
// decoded token must still land on req.user, and bad tokens must be rejected.
describe("LocalAuthConnection.middleware", () => {
  const claims = { email: "user@example.com" };
  const signOpts: jwt.SignOptions = {
    algorithm: "HS256",
    audience: "https://api.growthbook.io",
    issuer: "https://api.growthbook.io",
    subject: "u_123",
    expiresIn: 60,
  };

  function run(token: string) {
    const req = ({
      method: "GET",
      headers: { authorization: `Bearer ${token}` },
    } as unknown) as Request & { user?: jwt.JwtPayload };
    return new Promise<{ req: typeof req; err?: { status?: number } }>(
      (resolve) => {
        new LocalAuthConnection().middleware(req, {} as Response, (err) =>
          resolve({ req, err })
        );
      }
    );
  }

  it("sets req.user for a valid token", async () => {
    const { req, err } = await run(jwt.sign(claims, JWT_SECRET, signOpts));
    expect(err).toBeUndefined();
    expect(req.user?.sub).toBe("u_123");
    expect(req.user?.email).toBe("user@example.com");
  });

  it("rejects a token signed with a different secret", async () => {
    const { req, err } = await run(jwt.sign(claims, "wrong-secret", signOpts));
    expect(err?.status).toBe(401);
    expect(req.user).toBeUndefined();
  });

  it("rejects an unsigned (alg none) token", async () => {
    const token = jwt.sign(claims, "", { ...signOpts, algorithm: "none" });
    const { req, err } = await run(token);
    expect(err?.status).toBe(401);
    expect(req.user).toBeUndefined();
  });
});
