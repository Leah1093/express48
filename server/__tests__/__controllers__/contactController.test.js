import { jest } from "@jest/globals";

// ---- Mock Service ----
const handleMessageMock = jest.fn();

jest.unstable_mockModule("../../service/contact.service.js", () => ({
  ContactService: jest.fn().mockImplementation(() => ({
    handleMessage: handleMessageMock,
  })),
}));

// ---- Imports ----
const { default: ContactController } = await import(
  "../../controllers/contact.controller.js"
);
const { CustomError } = await import("../../utils/CustomError.js");

describe("ContactController", () => {
  let controller;
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ContactController();

    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("sendMessage", () => {
    test("should respond 200 on success", async () => {
      req.body = {
        name: "Alice",
        email: "alice@example.com",
        message: "Hello",
        phone: "0501234567",
      };
      handleMessageMock.mockResolvedValueOnce({ _id: "1", ...req.body });

      await controller.sendMessage(req, res, next);

      expect(handleMessageMock).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "ההודעה נשלחה ונשמרה בהצלחה",
        data: { _id: "1", ...req.body },
      });
    });

    test("should call next with CustomError if service throws", async () => {
      req.body = {
        name: "Alice",
        email: "alice@example.com",
        message: "Hello",
      };
      const error = new CustomError("DB error", 500);
      handleMessageMock.mockRejectedValueOnce(error);

      await controller.sendMessage(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
