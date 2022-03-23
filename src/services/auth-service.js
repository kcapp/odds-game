import axios from "axios";
const API_URL = "http://localhost:9001/user/";
class AuthService {
  login(user) {
    return axios
      .post(
        API_URL + "login",
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
