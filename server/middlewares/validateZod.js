export const validateZod =
  ({ body, query, params } = {}) =>
  (req, res, next) => {
    try {
      if (body && typeof body.parse === "function")   req.body = body.parse(req.body);
      if (query && typeof query.parse === "function") req.query = query.parse(req.query);
      if (params && typeof params.parse === "function") req.params = params.parse(req.params);
      next();
    } catch (err) {
      res.status(400).json({ status: 400, error: err.errors?.[0]?.message || "Invalid request" });
    }
  };
