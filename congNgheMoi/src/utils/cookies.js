import Cookies from "js-cookie";

export const saveTokenToCookies = (token) => {
  Cookies.set("authToken", token, { expires: 7 }); // Lưu token trong 7 ngày
};

export const getTokenFromCookies = () => {
  return Cookies.get("authToken");
};

export const removeTokenFromCookies = () => {
  Cookies.remove("authToken");
};