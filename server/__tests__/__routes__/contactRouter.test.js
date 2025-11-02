import request from "supertest";
import express from "express";
import { jest } from "@jest/globals";

// ---- Mocks ----
const sendMessageMock = jest.fn((req, res) =>
  res.status(200).json({ success: true, message: "ok" })
);

jest.unstable_mockModule("../../controllers/contact.controller.js", () => ({
  default: jest.fn().mockImplementation(() => ({
    sendMessage: sendMessageMock,
  })),
}));

const contactLimiterMock = jest.fn((req, res, next) => next());
const verifyRecaptchaMock = jest.fn((req, res, next) => next());

jest.unstable_mockModule("../../middlewares/contactLimiter.js", () => ({
  contactLimiter: contactLimiterMock,
}));
jest.unstable_mockModule("../../middlewares/verifyRecaptcha.js", () => ({
  verifyRecaptcha: verifyRecaptchaMock,
}));

// ---- Imports אחרי mocks ----
const { contactRouter } = await import("../../router/contactRouter.js");
const { errorHandler } = await import("../../middlewares/errorHandler.js");

describe("Contact Router (Integration)", () => {
  let app;

  // השתקה של console.error בטסטים
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/contact", contactRouter);
    app.use(errorHandler);
  });

  test("POST /contact/send → success", async () => {
    const res = await request(app)
      .post("/contact/send")
      .send({ name: "Alice", email: "a@b.com", message: "hi" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: "ok" });
    expect(contactLimiterMock).toHaveBeenCalled();
    expect(verifyRecaptchaMock).toHaveBeenCalled();
    expect(sendMessageMock).toHaveBeenCalled();
  });

  test("POST /contact/send → blocked by limiter", async () => {
    contactLimiterMock.mockImplementationOnce((req, res) =>
      res.status(429).json({ error: "Too many requests" })
    );

    const res = await request(app).post("/contact/send").send({});
    expect(res.status).toBe(429);
    expect(res.body).toEqual({ error: "Too many requests" });
    expect(sendMessageMock).not.toHaveBeenCalled();
  });

  test("POST /contact/send → recaptcha failed", async () => {
    verifyRecaptchaMock.mockImplementationOnce((req, res) =>
      res.status(400).json({ error: "Recaptcha failed" })
    );

    const res = await request(app).post("/contact/send").send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Recaptcha failed" });
    expect(sendMessageMock).not.toHaveBeenCalled();
  });

  test("POST /contact/send → controller throws error", async () => {
    const error = new Error("DB error");
    sendMessageMock.mockImplementationOnce(() => {
      throw error;
    });

    const res = await request(app)
      .post("/contact/send")
      .send({ name: "Alice", email: "a@b.com", message: "hi" });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("status", 500);
    expect(res.body).toHaveProperty("error");
  });
});
