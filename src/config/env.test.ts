import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

const valid = {
  APP_URL: "http://localhost:3000",
  DATABASE_URL: "postgres://poster:poster@localhost:5432/poster",
  REDIS_URL: "redis://localhost:6379",
  S3_ENDPOINT: "http://localhost:9000",
  S3_REGION: "us-east-1",
  S3_BUCKET: "poster",
  S3_ACCESS_KEY_ID: "minio",
  S3_SECRET_ACCESS_KEY: "minio-secret",
  ANTHROPIC_API_KEY: "test-key",
  ANTHROPIC_MODEL: "claude-sonnet-5-5",
  AUTH_SECRET: "x".repeat(32),
  TOKEN_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString("base64"),
};

describe("parseEnv (NFR security: config validation)", () => {
  it("accepts a complete valid environment and applies defaults", () => {
    expect(parseEnv(valid).S3_FORCE_PATH_STYLE).toBe("true");
  });

  it("rejects missing variables, naming them", () => {
    const rest: Record<string, string | undefined> = { ...valid, DATABASE_URL: undefined };
    expect(() => parseEnv(rest)).toThrow(/DATABASE_URL/);
  });

  it("rejects a token key that is not 32 bytes", () => {
    expect(() => parseEnv({ ...valid, TOKEN_ENCRYPTION_KEY: "c2hvcnQ=" })).toThrow(
      /TOKEN_ENCRYPTION_KEY/,
    );
  });

  it("never includes secret values in error messages", () => {
    try {
      parseEnv({ ...valid, AUTH_SECRET: "too-short-secret" });
      expect.unreachable();
    } catch (e) {
      expect(String(e)).not.toContain("too-short-secret");
    }
  });
});
