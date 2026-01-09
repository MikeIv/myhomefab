import { deleteCookie } from "h3";

export default defineEventHandler(async (event) => {
  deleteCookie(event, "admin_auth");

  return {
    success: true,
    message: "Выход выполнен",
  };
});
