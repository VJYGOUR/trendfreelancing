import { getAuth } from "@clerk/express";

export const protect = (req, res, next) => {
  const auth = getAuth(req);

  if (!auth.userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  req.userId = auth.userId;

  next();
};
