import axios from "axios";
import appConfig from "../config/config.js";
class AuthService {
  login(user) {
    return axios
      .post(
        appConfig.kcappOddsApiUrl + "/user/login",
        {
          login: user.login,
          password: user.password,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((response) => {
        if (response.data.token) {
          localStorage.setItem("user", JSON.stringify(response.data));
          return localStorage.getItem("user");
        }
        return response.data;
      });
  }
  logout() {
    localStorage.removeItem("user");
  }
}

export default AuthService;
