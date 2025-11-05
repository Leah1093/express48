import { jest } from "@jest/globals";

// ---- Mocks ----
const sendContactEmailMock = jest.fn();
const createMock = jest.fn();

jest.unstable_mockModule("../../utils/email/sendContactEmail.js", () => ({
  sendContactEmail: sendContactEmailMock,
}));

jest.unstable_mockModule("../../models/contactMessage.js", () => ({
  ContactMessage: { create: createMock },
}));

// ---- Imports ----
const { ContactService } = await import("../../service/contact.service.js");
const { CustomError } = await import("../../utils/CustomError.js");

describe("ContactService", () => {
  let service;
  const payload = {
    name: "Alice",
    email: "alice@example.com",
    message: "Help me please",
    phone: "0501234567",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ContactService();
  });

  describe("handleMessage", () => {
    test("should send email and save to DB successfully", async () => {
      sendContactEmailMock.mockResolvedValueOnce();
      createMock.mockResolvedValueOnce({ _id: "123", ...payload });

      const result = await service.handleMessage(payload);

      expect(sendContactEmailMock).toHaveBeenCalledWith({
        name: payload.name,
        email: payload.email,
        message: payload.message,
      });
      expect(createMock).toHaveBeenCalledWith(payload);
      expect(result).toEqual({ _id: "123", ...payload });
    });

    test("should throw CustomError if honeypot is present", async () => {
      await expect(
        service.handleMessage({ ...payload, honeypot: "bot" })
      ).rejects.toThrow(CustomError);
      expect(sendContactEmailMock).not.toHaveBeenCalled();
      expect(createMock).not.toHaveBeenCalled();
    });

    test("should throw CustomError if missing required fields", async () => {
      await expect(
        service.handleMessage({ email: "a@b.com" })
      ).rejects.toThrow(CustomError);
      expect(sendContactEmailMock).not.toHaveBeenCalled();
      expect(createMock).not.toHaveBeenCalled();
    });

    test("should throw CustomError if sendContactEmail fails", async () => {
      sendContactEmailMock.mockRejectedValueOnce(new Error("SMTP error"));

      await expect(service.handleMessage(payload)).rejects.toThrow(CustomError);

      expect(sendContactEmailMock).toHaveBeenCalled();
      expect(createMock).not.toHaveBeenCalled();
    });

    test("should throw CustomError if DB create fails", async () => {
      sendContactEmailMock.mockResolvedValueOnce();
      createMock.mockRejectedValueOnce(new Error("DB error"));

      await expect(service.handleMessage(payload)).rejects.toThrow(CustomError);

      expect(sendContactEmailMock).toHaveBeenCalled();
      expect(createMock).toHaveBeenCalledWith(payload);
    });
  });
});
