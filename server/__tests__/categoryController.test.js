import { jest } from "@jest/globals";

// מוקים ל־CategoryService
jest.unstable_mockModule("../service/categoryService.js", () => ({
  __esModule: true,
  CategoryService: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    uploadIcon: jest.fn(),
  })),
}));

// אחרי ה־mock נייבא את הקונטרולר וה־service
const { CategoryController, service } = await import("../controllers/categoryController.js");
const { CustomError } = await import("../utils/CustomError.js");

describe("CategoryController (global service)", () => {
  let controller, req, res, next;

  beforeEach(() => {
    controller = new CategoryController();

    req = { body: {}, params: {}, file: null };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();

    jest.clearAllMocks();
  });

  // --- create ---
  test("create should call service.create with icon", async () => {
    req.body = { name: "Phones" };
    req.file = { filename: "icon.png" };
    const fake = { _id: "1", name: "Phones", icon: "/uploads/icons/icon.png" };
    service.create.mockResolvedValue(fake);

    await controller.create(req, res, next);

    expect(service.create).toHaveBeenCalledWith({
      name: "Phones",
      parentId: null,
      icon: "/uploads/icons/icon.png",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fake);
  });

  test("create should call next on error", async () => {
    service.create.mockRejectedValue(new Error("fail"));
    await controller.create(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // --- list ---
  test("list should return categories", async () => {
    const fake = [{ _id: "1" }];
    service.list.mockResolvedValue(fake);

    await controller.list(req, res, next);

    expect(res.json).toHaveBeenCalledWith(fake);
  });

  test("list should call next on error", async () => {
    service.list.mockRejectedValue(new Error("fail"));
    await controller.list(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // --- get ---
  test("get should return category", async () => {
    req.params.id = "1";
    const fake = { _id: "1" };
    service.getById.mockResolvedValue(fake);

    await controller.get(req, res, next);

    expect(res.json).toHaveBeenCalledWith(fake);
  });

  test("get should call next on error", async () => {
    req.params.id = "1";
    service.getById.mockRejectedValue(new Error("fail"));
    await controller.get(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // --- update ---
  test("update should update category with icon", async () => {
    req.params.id = "1";
    req.body = { name: "New" };
    req.file = { filename: "icon.png" };
    const fake = { _id: "1", name: "New", icon: "/uploads/icons/icon.png" };
    service.update.mockResolvedValue(fake);

    await controller.update(req, res, next);

    expect(service.update).toHaveBeenCalledWith("1", {
      name: "New",
      parentId: null,
      icon: "/uploads/icons/icon.png",
    });
    expect(res.json).toHaveBeenCalledWith(fake);
  });

  test("update should return 404 if null", async () => {
    req.params.id = "1";
    req.body = { name: "Test" };
    service.update.mockResolvedValue(null);

    await controller.update(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Category not found" });
  });

  test("update should call next on error", async () => {
    req.params.id = "1";
    service.update.mockRejectedValue(new Error("fail"));
    await controller.update(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // --- remove ---
  test("remove should return ok", async () => {
    req.params.id = "1";
    service.remove.mockResolvedValue({});
    await controller.remove(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  test("remove should call next on error", async () => {
    req.params.id = "1";
    service.remove.mockRejectedValue(new Error("fail"));
    await controller.remove(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // --- uploadIcon ---
  test("uploadIcon should upload icon", async () => {
    req.params.id = "1";
    req.file = { path: "/tmp/icon.png" };
    const fake = { _id: "1", icon: "/uploads/icons/icon.png" };
    service.uploadIcon.mockResolvedValue(fake);

    await controller.uploadIcon(req, res, next);

    expect(service.uploadIcon).toHaveBeenCalledWith("1", "/tmp/icon.png");
    expect(res.json).toHaveBeenCalledWith(fake);
  });

  test("uploadIcon should call next if no file", async () => {
    req.params.id = "1";
    req.file = null;

    await controller.uploadIcon(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(CustomError));
  });

  test("uploadIcon should call next on service error", async () => {
    req.params.id = "1";
    req.file = { path: "/tmp/icon.png" };
    service.uploadIcon.mockRejectedValue(new Error("fail"));

    await controller.uploadIcon(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
