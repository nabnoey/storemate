export const getAccessToken = (): string | null => {
  // 1. cookie
  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  // 2. fallback localStorage
  const localToken = localStorage.getItem("token");

  return cookieToken || localToken || null;
};
