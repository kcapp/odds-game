import axios from "axios";

class AuthService {
  login(user) {
    return axios
      .post(
        "/api/user/login",
        {
          login: user.login,
          password: btoa(user.password),
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
        throw new Error(error.response.data.message);
      });
  }
  logout() {
    localStorage.removeItem("user");
  }
}

export default AuthService;
