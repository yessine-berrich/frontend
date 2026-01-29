// services/auth.service.ts

const API_URL = "http://localhost:3000/api";

export async function signup(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${API_URL}/users/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Signup failed");
  }

  return res.json(); // retourne user créé
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/users/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  // On vérifie seulement res.ok car l'API ne renvoie pas de champ "success"
  if (!res.ok) {
    throw new Error(data.message || "Identifiants invalides");
  }

  // Utilisation de accessToken au lieu de token
  if (data.accessToken) {
    localStorage.setItem("auth_token", data.accessToken);
    
    // Note: Vérifiez si votre API renvoie aussi un objet "user". 
    // Si ce n'est pas le cas, cette ligne pourrait stocker "undefined"
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  }

  return data;
}

// Fonction pour récupérer le token pour tes futurs appels API
export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user");
  window.location.href = "/signin";
};

export async function fetchCurrentUser() {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  const res = await fetch(`${API_URL}/users/current-user`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Erreur lors de la récupération du profil");
  return res.json();
}