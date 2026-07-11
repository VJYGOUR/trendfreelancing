import { getAuth } from "@clerk/express";

export const protect = (req, res, next) => {
  const uId = req.auth;
  console.log(uId);
  const auth = getAuth(req);

  if (!auth.userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  console.log(auth.userId);
  req.userId = auth.userId;

  next();
};
