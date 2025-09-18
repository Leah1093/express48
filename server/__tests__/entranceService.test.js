// __tests__/entranceService.test.js
import bcrypt from "bcrypt";
import { EntranceService } from "../service/entrance.service.js";
import { User } from "../models/user.js";
import { Password } from "../models/password.js";
// ממקבלים את המודלים
jest.mock("../src/models/User.js");
jest.mock("../src/models/Password.js");
jest.mock("bcrypt");

describe("EntranceService.registerUser", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("צריך לזרוק שגיאה אם המייל כבר קיים", async () => {
    User.findOne.mockResolvedValue({ _id: "123" });

    const service = new EntranceService();
    await expect(
      service.registerUser({ username: "U1", email: "test@test.com", phone: "0500000000", password: "123456" })
    ).rejects.toMatchObject({
      message: "המייל כבר קיים במערכת",
      statusCode: 409,
    });

    expect(User.findOne).toHaveBeenCalledWith({ email: "test@test.com" });
  });

  it("צריך ליצור משתמש חדש עם סיסמה מוצפנת", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: "123", username: "U1", email: "test@test.com", phone: "0500000000" });

    bcrypt.hash.mockResolvedValue("hashedPassword123");
    Password.create.mockResolvedValue({});

    const service = new EntranceService();
    const result = await service.registerUser({
      username: "U1",
      email: "test@test.com",
      phone: "0500000000",
      password: "123456",
    });

    expect(User.create).toHaveBeenCalledWith({
      username: "U1",
      email: "test@test.com",
      phone: "0500000000",
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
    expect(Password.create).toHaveBeenCalledWith({
      userId: "123",
      password: "hashedPassword123",
    });

    expect(result).toEqual({
      user: { _id: "123", username: "U1", email: "test@test.com", phone: "0500000000" },
    });
  });
});
