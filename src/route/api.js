import express from "express";
import { authMiddleware } from "../middleware/auth-middleware.js";
import userController from "../controller/user-controller.js";
import contactController from "../controller/contact-controller.js";
import addressController from "../controller/address-controller.js";

const route = new express.Router();
route.use(authMiddleware);

// User API
route.get("/api/users/current", userController.get);
route.patch("/api/users/current", userController.update);
route.delete("/api/users/logout", userController.logout);

// Contact API
route.post("/api/contacts", contactController.create);
route.get("/api/contacts/:contactId", contactController.get);
route.get("/api/contacts/", contactController.getAll);
route.put("/api/contacts/:contactId", contactController.update);
route.delete("/api/contacts/:contactId", contactController.remove);

// Address API
route.post("/api/contacts/:contactId/addresses", addressController.create);
route.get(
  "/api/contacts/:contactId/addresses/:addressId",
  addressController.get
);
route.get("/api/contacts/:contactId/addresses", addressController.getAll);
route.put(
  "/api/contacts/:contactId/addresses/:addressId",
  addressController.update
);
route.delete(
  "/api/contacts/:contactId/addresses/:addressId",
  addressController.remove
);

export { route };
