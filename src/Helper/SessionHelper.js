class SessionHelper {
  setToken(token) {
    localStorage.setItem("token", token);
  }
  getToken() {
    return localStorage.getItem("token");
  }

  setUserDetails(UserDetails) {
    localStorage.setItem("UserDetails", JSON.stringify(UserDetails));
  }
  getUserDetails() {
    return JSON.parse(localStorage.getItem("UserDetails"));
  }

  setBusinessDetails(BusinessDetails) {
    localStorage.setItem("businessDetails", JSON.stringify(BusinessDetails));
  }

  setPermissionDetails(PermissionDetails) {
    localStorage.setItem(
      "permissionDetails",
      JSON.stringify(PermissionDetails)
    );
  }

  getBusinessDetails() {
    return JSON.parse(localStorage.getItem("businessDetails"));
  }

  getPermissionDetails() {
    return JSON.parse(localStorage.getItem("permissionDetails"));
  }
  setEmail(Email) {
    localStorage.setItem("Email", Email);
  }
  getEmail() {
    return localStorage.getItem("Email");
  }
  setMobile(Mobile) {
    localStorage.setItem("Mobile", Mobile);
  }
  getMobile() {
    return localStorage.getItem("Mobile");
  }

  setName(fullName) {
    localStorage.setItem("fullName", fullName);
  }
  getName() {
    return localStorage.getItem("fullName");
  }

  setAdmin(admin) {
    localStorage.setItem("admin", admin);
  }

  getAdmin() {
    return localStorage.getItem("admin");
  }

  setRole(role) {
    localStorage.setItem("role", role);
  }
  getRole() {
    return localStorage.getItem("role");
  }
  removeSessions = () => {
    localStorage.clear();
    window.location.href = "/login";
  };
}

export const {
  setEmail,
  getEmail,
  setAdmin,
  getAdmin,
  setRole,
  getRole,
  setMobile,
  getMobile,
  setName,
  getName,
  setToken,
  getToken,
  setUserDetails,
  getUserDetails,
  setBusinessDetails,
  getBusinessDetails,
  setPermissionDetails,
  getPermissionDetails,
  removeSessions,
} = new SessionHelper();
