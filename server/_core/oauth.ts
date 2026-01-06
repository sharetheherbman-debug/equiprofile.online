import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code) {
      console.error("[OAuth] Missing authorization code");
      res.status(400).send(`
        <html>
          <body>
            <h1>OAuth Error</h1>
            <p>Missing authorization code. The OAuth callback requires a 'code' parameter.</p>
            <p><a href="/">Return to home</a></p>
          </body>
        </html>
      `);
      return;
    }

    if (!state) {
      console.error("[OAuth] Missing state parameter");
      res.status(400).send(`
        <html>
          <body>
            <h1>OAuth Error</h1>
            <p>Missing state parameter. The OAuth callback requires a 'state' parameter for security.</p>
            <p><a href="/">Return to home</a></p>
          </body>
        </html>
      `);
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        console.error("[OAuth] Missing openId in user info");
        res.status(400).send(`
          <html>
            <body>
              <h1>OAuth Error</h1>
              <p>Unable to retrieve user identification from OAuth provider.</p>
              <p><a href="/">Return to home</a></p>
            </body>
          </html>
        `);
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      // Escape HTML to prevent XSS
      const escapeHtml = (str: string) => {
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      };
      const errorMessage = error instanceof Error ? escapeHtml(error.message) : "Unknown error";
      res.status(500).send(`
        <html>
          <body>
            <h1>OAuth Authentication Failed</h1>
            <p>Failed to complete OAuth authentication: ${errorMessage}</p>
            <p>Please try logging in again or contact support if the problem persists.</p>
            <p><a href="/">Return to home</a></p>
          </body>
        </html>
      `);
    }
  });
}
