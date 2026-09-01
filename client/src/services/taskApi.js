const API_BASE = import.meta.env.VITE_API_URL || "";
const REQUEST_TIMEOUT = 10000;

const apiUrl = (path) => `${API_BASE}${path}`;

const fetchWithTimeout = async (
  url,
  options = {},
  timeout = REQUEST_TIMEOUT,
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getAuthToken = () => {
  try {
    return localStorage.getItem("taskAuthToken") || "";
  } catch {
    return "";
  }
};

const getRefreshToken = () => {
  try {
    return localStorage.getItem("taskRefreshToken") || "";
  } catch {
    return "";
  }
};

const setSession = (token, user, refreshToken = "") => {
  try {
    localStorage.setItem("taskAuthToken", token);
    localStorage.setItem("taskUser", JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem("taskRefreshToken", refreshToken);
    }
  } catch {
    // ignore storage issues in restricted environments
  }
};

export const clearSession = () => {
  try {
    localStorage.removeItem("taskAuthToken");
    localStorage.removeItem("taskUser");
    localStorage.removeItem("taskRefreshToken");
  } catch {
    // ignore storage issues in restricted environments
  }
};

export const refreshAuthToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    const response = await fetchWithTimeout(apiUrl("/api/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      clearSession();
      return false;
    }

    localStorage.setItem("taskAuthToken", data.token);
    localStorage.setItem("taskRefreshToken", data.refreshToken);
    return true;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
};

export const loginUser = async ({ username, password }) => {
  const response = await fetchWithTimeout(apiUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  let data;
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error("Server returned invalid response", { cause: error });
  }

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  setSession(data.token, data.user, data.refreshToken);
  return data;
};

export const registerUser = async ({
  name,
  username,
  email,
  password,
  confirmPassword,
}) => {
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const response = await fetchWithTimeout(apiUrl("/api/auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, username, email, password, confirmPassword }),
  });

  let data;
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error("Server returned invalid response", { cause: error });
  }

  if (!response.ok) {
    const errorMsg =
      data.errors?.join(", ") || data.message || "Registration failed";
    throw new Error(errorMsg);
  }

  setSession(data.token, data.user, data.refreshToken);
  return data;
};

const authHeaders = (extraHeaders = {}) => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getErrorMessage = async (response, fallback) => {
  try {
    const data = await response.clone().json();
    return data.message || fallback;
  } catch {
    return fallback;
  }
};

const handleAuthError = async (response) => {
  if (response.status === 401) {
    let data = {};
    try {
      data = await response.json();
    } catch {
      // Fall through to clearing an invalid session.
    }
    if (data.code === "TOKEN_EXPIRED") {
      const refreshed = await refreshAuthToken();
      if (refreshed) {
        return "token_refreshed";
      }
    }
    clearSession();
    window.location.href = "/";
  }
  return null;
};

export const getTasks = async (query = "", page = 1, limit = 20) => {
  let url = apiUrl("/api/tasks?page=" + page + "&limit=" + limit);
  if (query.trim()) {
    url += "&q=" + encodeURIComponent(query.trim());
  }

  const response = await fetchWithTimeout(url, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    const authResult = await handleAuthError(response);
    if (authResult === "token_refreshed") {
      return getTasks(query, page, limit);
    }
    throw new Error(await getErrorMessage(response, "Could not load tasks"));
  }

  return response.json();
};

export const createTask = async (taskData) => {
  const response = await fetchWithTimeout(apiUrl("/api/tasks"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const authResult = await handleAuthError(response);
    if (authResult === "token_refreshed") {
      return createTask(taskData);
    }
    throw new Error(await getErrorMessage(response, "Could not create task"));
  }

  return response.json();
};

export const toggleTaskById = async (taskId) => {
  const response = await fetchWithTimeout(
    apiUrl(`/api/tasks/${taskId}/toggle`),
    {
      method: "PATCH",
      headers: authHeaders(),
    },
  );

  if (!response.ok) {
    const authResult = await handleAuthError(response);
    if (authResult === "token_refreshed") {
      return toggleTaskById(taskId);
    }
    throw new Error(await getErrorMessage(response, "Could not update task"));
  }

  return response.json();
};

export const updateTaskById = async (taskId, taskData) => {
  const response = await fetchWithTimeout(apiUrl(`/api/tasks/${taskId}`), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const authResult = await handleAuthError(response);
    if (authResult === "token_refreshed") {
      return updateTaskById(taskId, taskData);
    }
    throw new Error(await getErrorMessage(response, "Could not edit task"));
  }

  return response.json();
};

export const deleteTaskById = async (taskId) => {
  const response = await fetchWithTimeout(apiUrl(`/api/tasks/${taskId}`), {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!response.ok) {
    const authResult = await handleAuthError(response);
    if (authResult === "token_refreshed") {
      return deleteTaskById(taskId);
    }
    throw new Error(await getErrorMessage(response, "Could not delete task"));
  }

  return response.json();
};

export const logoutUser = async (refreshToken) => {
  try {
    await fetchWithTimeout(apiUrl("/api/auth/logout"), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    console.error("Logout request failed:", error);
  }
  clearSession();
};
