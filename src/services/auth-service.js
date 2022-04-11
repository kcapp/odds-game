import axios from "axios";
import config from "../config/config";

class AuthService {
  login(user) {
    return axios
      .post(
        config.kcappOddsApiUrl + "/user/login",
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
      })
      .catch((error) => {
        console.log(error);
      });
  }
  logout() {
    localStorage.removeItem("user");
  }
}

export default AuthService;
