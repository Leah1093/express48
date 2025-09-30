import request from "supertest";
import express from "express";
import { jest } from "@jest/globals";

// מוק ל־EntranceController
jest.unstable_mockModule("../../controllers/entrance.controller.js", () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      register: (req, res) => res.status(201).json({ success: true }),
      login: (req, res) => res.status(200).json({ success: true }),
      logout: (req, res) => res.status(200).json({ success: true }),
      getCurrentUser: (req, res) => res.status(200).json({ success: true, user: { id: "123" } }),
      refresh: (req, res) => res.status(200).json({ ok: true }),
    })),
  };
});

// מוק ל־authMiddleware
jest.unstable_mockModule("../../middlewares/auth.js", () => {
  return {
    authMiddleware: (req, res, next) => {
      req.user = { id: "123" }; // לדמות משתמש מחובר
      next();
    },
  };
});

let app;

beforeAll(async () => {
  const { entranceRouter } = await import("../../router/entrance.router.js");
  app = express();
  app.use(express.json());
  app.use("/entrance", entranceRouter);
});

describe("Entrance Router (mocked)", () => {
  it("POST /entrance/register", async () => {
    const res = await request(app).post("/entrance/register").send({ username: "user" });
    expect(res.status).toBe(201);
  });

  it("POST /entrance/login", async () => {
    const res = await request(app).post("/entrance/login").send({ email: "u@test.com", password: "123456" });
    expect(res.status).toBe(200);
  });

  it("POST /entrance/logout", async () => {
    const res = await request(app).post("/entrance/logout");
    expect(res.status).toBe(200);
  });

  it("GET /entrance/me", async () => {
    const res = await request(app).get("/entrance/me");
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: "123" });
  });

  it("POST /entrance/refresh", async () => {
    const res = await request(app).post("/entrance/refresh");
    expect(res.status).toBe(200);
  });
});
