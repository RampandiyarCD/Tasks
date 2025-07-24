const form = document.getElementById("form");
const cust_id = document.getElementById("cust_id");
const cust_error = document.getElementById("cust_error");
const pass = document.getElementById("pass");
const pass_error = document.getElementById("pass-error");

let usersData = [];
async function loadUserData() {
  try {
    const response = await fetch("./users.json");
    if (!response.ok) {
      throw new Error("Failed to load user data");
    }
    const data = await response.json();
    usersData = data.users;
  } catch (error) {
    console.error("Error loading user data:", error);
    cust_error.textContent = "System error. Please try again later.";
    cust_error.classList.remove("hidden");
  }
}
window.addEventListener("DOMContentLoaded", loadUserData);

function ifcorrect(element, errorElement, isValid) {
  if (isValid) {
    element.classList.remove(
      "border-red-500",
      "focus:border-red-500",
      "focus:ring-red-500"
    );
    element.classList.add(
      "border-green-500",
      "focus:border-green-500",
      "focus:ring-green-500"
    );
  } else {
    errorElement.classList.remove("hidden");
    element.classList.remove(
      "border-green-500",
      "focus:border-green-500",
      "focus:ring-green-500"
    );
    element.classList.add(
      "border-red-500",
      "focus:border-red-500",
      "focus:ring-red-500"
    );
  }
}

function ifwrong(element, errorElement) {
  errorElement.classList.add("hidden");
  element.classList.remove(
    "border-red-500",
    "focus:border-red-500",
    "focus:ring-red-500",
    "border-green-500",
    "focus:border-green-500",
    "focus:ring-green-500"
  );
  element.classList.add(
    "border-gray-300",
    "focus:border-[#0087A5]",
    "focus:ring-[#0087A5]"
  );
}

cust_id.addEventListener("input", () => {
  if (cust_id.value.trim() !== "") {
    ifcorrect(cust_id, cust_error, true);
  } else {
    ifwrong(cust_id, cust_error);
  }
});

pass.addEventListener("input", () => {
  if (pass.value.trim().length >= 8) {
    ifcorrect(pass, pass_error, true);
  } else {
    ifwrong(pass, pass_error);
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  let isValid = true;
  const username = cust_id.value.trim();
  const password = pass.value.trim();
  if (username === "") {
    cust_error.textContent = "Customer ID is required";
    ifcorrect(cust_id, cust_error, false);
    isValid = false;
  } else {
    ifcorrect(cust_id, cust_error, true);
  }
  if (password === "") {
    pass_error.textContent = "Password is required";
    ifcorrect(pass, pass_error, false);
    isValid = false;
  } else if (password.length < 8) {
    pass_error.textContent = "Password must be at least 8 characters long";
    ifcorrect(pass, pass_error, false);
    isValid = false;
  } else {
    ifcorrect(pass, pass_error, true);
  }

  if (isValid) {
    const user = usersData.find(
      (u) => u.login_id === username && u.password === password
    );

    if (user) {
      console.log("Login successful!", user);
      sessionStorage.setItem("currentUser", JSON.stringify(user));
      window.location.href = "./dashboard.html";
    } else {
      console.log("Invalid credentials");
      cust_error.textContent = "Invalid customer ID or password";
      pass_error.textContent = "Invalid customer ID or password";
      ifcorrect(cust_id, cust_error, false);
      ifcorrect(pass, pass_error, false);
    }
  }
});
