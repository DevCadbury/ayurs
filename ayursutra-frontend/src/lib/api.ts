export async function exchangeUidForJwt(
  idToken: string,
  payload: {
    uid: string;
    email?: string | null;
    name?: string | null;
    role?: string;
  }
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  try {
    const res = await fetch(`${apiBase}/api/auth/exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Exchange failed: ${res.status} ${errorText}`);
    }

    return res.json() as Promise<{ token: string; role: string }>;
  } catch (error: unknown) {
    // Handle network errors, timeouts, and other issues
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Backend server may be unavailable.");
    } else if (error.message?.includes("Failed to fetch")) {
      throw new Error(
        "Cannot connect to backend server. Please check if the server is running."
      );
    } else {
      throw error;
    }
  }
}

export async function selectUserRole(
  uid: string,
  role: string,
  extras?: { email?: string | null; name?: string | null }
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  try {
    const res = await fetch(`${apiBase}/api/auth/select-role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid,
        role,
        email: extras?.email,
        name: extras?.name,
      }),
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Role selection failed: ${res.status} ${errorText}`);
    }

    return res.json() as Promise<{ token: string; role: string }>;
  } catch (error: unknown) {
    // Handle network errors, timeouts, and other issues
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Backend server may be unavailable.");
    } else if (error.message?.includes("Failed to fetch")) {
      throw new Error(
        "Cannot connect to backend server. Please check if the server is running."
      );
    } else {
      throw error;
    }
  }
}

export async function checkUserExists(uid: string) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  try {
    const res = await fetch(`${apiBase}/api/auth/check-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      // If user doesn't exist, return false
      if (res.status === 404) {
        return false;
      }
      throw new Error(`Check user failed: ${res.status}`);
    }

    const data = await res.json();
    return data.exists;
  } catch (error: unknown) {
    // If backend is not available, assume user doesn't exist (new user)
    console.warn("Backend not available, assuming new user:", error);
    return false;
  }
}

// Build Authorization header resiliently for demo/dev modes
function getAuthHeader(
  token?: string | null,
  uidFallback?: string | null
): Record<string, string> {
  // Prioritize the token parameter if provided
  if (token && token !== "demo-token") {
    return { Authorization: `Bearer ${token}` };
  }

  // For demo mode, use the UID fallback or a demo UID
  if (uidFallback) {
    return { Authorization: `Bearer ${uidFallback}` };
  }

  // Try to read UID from persisted auth store in the browser
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem("auth-storage");
      if (raw) {
        const parsed = JSON.parse(raw);
        const state = parsed?.state ?? parsed;
        const uid = state?.uid as string | undefined;
        if (uid) return { Authorization: `Bearer ${uid}` };
      }
    } catch {}
  }

  // Use demo UID as fallback
  return { Authorization: `Bearer demo-patient-123` };
}

// Schedule API functions
export async function getPatientAppointments(
  patientId: string,
  token?: string
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  // Use the token directly, with patientId as fallback for demo mode
  const authHeaders = getAuthHeader(token, patientId);
  console.log("Auth headers for appointments:", authHeaders);

  try {
    const res = await fetch(`${apiBase}/api/schedule/patient/${patientId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Backend error ${res.status}:`, errorText);

      // If it's a token error, return empty appointments for demo mode
      if (
        errorText.includes("Invalid token") ||
        errorText.includes("Missing token")
      ) {
        console.warn(
          "Backend requires valid authentication, returning empty appointments for demo mode"
        );
        return [];
      }

      throw new Error(
        `Failed to fetch appointments: ${res.status} - ${errorText}`
      );
    }

    return res.json();
  } catch (error: unknown) {
    console.error("Error fetching appointments:", error);

    // Return empty appointments for demo mode when backend is down
    if (
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("500")
    ) {
      console.warn(
        "Backend unavailable, returning empty appointments for demo mode"
      );
      return [];
    }

    throw error;
  }
}

export async function createAppointment(
  appointmentData: {
    patient: string;
    doctor: string;
    therapy: string;
    startTime: string;
    endTime: string;
    notes?: string;
  },
  token: string
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  try {
    const res = await fetch(`${apiBase}/api/schedule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(appointmentData),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || `Failed to create appointment: ${res.status}`
      );
    }

    return res.json();
  } catch (error: unknown) {
    console.error("Error creating appointment:", error);
    throw error;
  }
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: string,
  token: string
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  try {
    const res = await fetch(`${apiBase}/api/schedule/${appointmentId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || `Failed to update appointment: ${res.status}`
      );
    }

    return res.json();
  } catch (error: unknown) {
    console.error("Error updating appointment status:", error);
    throw error;
  }
}

export async function getAllAppointments(token: string) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  try {
    const res = await fetch(`${apiBase}/api/schedule`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Backend error ${res.status}:`, errorText);

      // If it's a token error, return empty appointments for demo mode
      if (
        errorText.includes("Invalid token") ||
        errorText.includes("Missing token")
      ) {
        console.warn(
          "Backend requires valid authentication, returning empty appointments for demo mode"
        );
        return [];
      }

      throw new Error(
        `Failed to fetch appointments: ${res.status} - ${errorText}`
      );
    }

    return res.json();
  } catch (error: unknown) {
    console.error("Error fetching all appointments:", error);

    // Return empty appointments for demo mode when backend is down
    if (
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("500")
    ) {
      console.warn(
        "Backend unavailable, returning empty appointments for demo mode"
      );
      return [];
    }

    throw error;
  }
}

export async function getMemberSessions(memberId: string, token: string) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  try {
    const res = await fetch(`${apiBase}/api/schedule/member/${memberId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Backend error ${res.status}:`, errorText);

      // If it's a token error, return empty sessions for demo mode
      if (
        errorText.includes("Invalid token") ||
        errorText.includes("Missing token")
      ) {
        console.warn(
          "Backend requires valid authentication, returning empty sessions for demo mode"
        );
        return [];
      }

      throw new Error(
        `Failed to fetch member sessions: ${res.status} - ${errorText}`
      );
    }

    return res.json();
  } catch (error: unknown) {
    console.error("Error fetching member sessions:", error);

    // Return empty sessions for demo mode when backend is down
    if (
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("500")
    ) {
      console.warn(
        "Backend unavailable, returning empty sessions for demo mode"
      );
      return [];
    }

    throw error;
  }
}

export async function updateAppointment(
  id: string,
  data: Partial<{
    startTime: string;
    endTime: string;
    notes: string;
    therapy: string;
  }>,
  token: string
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";
  const res = await fetch(`${apiBase}/api/schedule/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Failed to update appointment: ${res.status}`);
  return res.json();
}

export async function deleteAppointment(id: string, token: string) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";
  const res = await fetch(`${apiBase}/api/schedule/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Failed to delete appointment: ${res.status}`);
  return res.json();
}

export async function getAvailableTimeSlots(
  doctorId: string,
  date: string,
  token: string
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  try {
    const res = await fetch(
      `${apiBase}/api/schedule/availability/${doctorId}/${date}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch available slots: ${res.status}`);
    }

    return res.json();
  } catch (error: unknown) {
    console.error("Error fetching available slots:", error);
    throw error;
  }
}

// Users API functions
export async function getDoctors(token?: string) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  const authHeaders = getAuthHeader(token, null);
  console.log("Auth headers for doctors:", authHeaders);

  try {
    const res = await fetch(`${apiBase}/api/users?role=doctor`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Backend error ${res.status}:`, errorText);

      // If it's a token error, return empty array for demo mode
      if (
        errorText.includes("Invalid token") ||
        errorText.includes("Missing token")
      ) {
        console.warn(
          "Backend requires valid authentication, returning empty doctors list for demo mode"
        );
        return [];
      }

      throw new Error(`Failed to fetch doctors: ${res.status} - ${errorText}`);
    }

    return res.json();
  } catch (error: unknown) {
    console.error("Error fetching doctors:", error);
    // Return empty array for demo mode when backend is down
    if (
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("500")
    ) {
      console.warn(
        "Backend unavailable, returning empty doctors list for demo mode"
      );
      return [];
    }
    throw error;
  }
}

// Admin: list users (optional role and search)
export async function listUsers(token: string, role?: string, query?: string) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";
  const url = new URL(`${apiBase}/api/users`);
  if (role) url.searchParams.set("role", role);
  if (query) url.searchParams.set("query", query);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Backend error ${res.status}:`, errorText);

      // If it's a token error, return empty users for demo mode
      if (
        errorText.includes("Invalid token") ||
        errorText.includes("Missing token")
      ) {
        console.warn(
          "Backend requires valid authentication, returning empty users for demo mode"
        );
        return [];
      }

      throw new Error(`Failed to list users: ${res.status} - ${errorText}`);
    }

    return res.json();
  } catch (error: unknown) {
    console.error("Error listing users:", error);

    // Return empty users for demo mode when backend is down
    if (
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("500")
    ) {
      console.warn("Backend unavailable, returning empty users for demo mode");
      return [];
    }

    throw error;
  }
}

export async function createUserAdmin(
  data: { name?: string; email: string; role: string; isApproved?: boolean },
  token: string
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";
  const res = await fetch(`${apiBase}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Failed to create user: ${res.status}`);
  return res.json();
}

export async function updateUserAdmin(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    role: string;
    isApproved: boolean;
  }>,
  token: string
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";
  const res = await fetch(`${apiBase}/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Failed to update user: ${res.status}`);
  return res.json();
}

export async function deleteUserAdmin(id: string, token: string) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";
  const res = await fetch(`${apiBase}/api/users/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Failed to delete user: ${res.status}`);
  return res.json();
}

export async function getCurrentUser(token: string) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  try {
    const res = await fetch(`${apiBase}/api/users/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Backend error ${res.status}:`, errorText);

      // If it's a token error, return a demo user for demo mode
      if (
        errorText.includes("Invalid token") ||
        errorText.includes("Missing token")
      ) {
        console.warn(
          "Backend requires valid authentication, returning demo user for demo mode"
        );
        return {
          _id: "demo-user-123",
          displayName: "Demo User",
          email: "demo@example.com",
          role: "patient",
        };
      }

      throw new Error(
        `Failed to fetch current user: ${res.status} - ${errorText}`
      );
    }

    return res.json();
  } catch (error: unknown) {
    console.error("Error fetching current user:", error);

    // Return demo user for demo mode when backend is down
    if (
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("500")
    ) {
      console.warn("Backend unavailable, returning demo user for demo mode");
      return {
        _id: "demo-user-123",
        displayName: "Demo User",
        email: "demo@example.com",
        role: "patient",
      };
    }

    throw error;
  }
}

export async function updateCurrentUser(
  data: Record<string, unknown>,
  token: string
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";
  const res = await fetch(`${apiBase}/api/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Failed to update current user: ${res.status}`);
  return res.json();
}

export async function approveUser(id: string, token: string) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";
  const res = await fetch(`${apiBase}/api/users/${id}/approve`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Failed to approve user: ${res.status}`);
  return res.json();
}

export async function searchDoctors(
  query: string,
  token?: string,
  uidFallback?: string
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  try {
    const url = new URL(`${apiBase}/api/users`);
    url.searchParams.set("role", "doctor");
    url.searchParams.set("query", query);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token || uidFallback) {
      headers.Authorization = `Bearer ${
        token && token.includes(".") ? token : uidFallback || token || ""
      }`;
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      throw new Error(`Failed to search doctors: ${res.status}`);
    }

    return res.json() as Promise<
      Array<{
        id: string;
        name: string;
        specialty?: string;
        photoURL?: string;
        avatar?: string;
        image?: string;
      }>
    >;
  } catch (error: unknown) {
    console.error("Error searching doctors:", error);
    throw error;
  }
}

export async function getDoctorById(
  id: string,
  token?: string,
  uidFallback?: string
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token || uidFallback) {
    headers.Authorization = `Bearer ${
      token && token.includes(".") ? token : uidFallback || token || ""
    }`;
  }
  const res = await fetch(`${apiBase}/api/users/${id}`, {
    headers,
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Failed to fetch doctor: ${res.status}`);
  return res.json() as Promise<{
    _id: string;
    displayName: string;
    specialty?: string;
    bio?: string;
    photoURL?: string;
    rating?: number;
    reviewsCount?: number;
  }>;
}

export async function getDoctorReviews(
  id: string,
  token?: string,
  uidFallback?: string
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token || uidFallback) {
    headers.Authorization = `Bearer ${
      token && token.includes(".") ? token : uidFallback || token || ""
    }`;
  }
  const res = await fetch(`${apiBase}/api/feedback/doctor/${id}`, {
    headers,
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Failed to fetch reviews: ${res.status}`);
  return res.json() as Promise<
    Array<{
      _id: string;
      rating: number;
      comment?: string;
      patient?: { displayName?: string; photoURL?: string };
      createdAt?: string;
    }>
  >;
}

// Therapies API functions
export async function getTherapies(token?: string) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  const authHeaders = getAuthHeader(token, null);
  console.log("Auth headers for therapies:", authHeaders);

  try {
    const res = await fetch(`${apiBase}/api/therapies`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Backend error ${res.status}:`, errorText);

      // If it's a token error, return empty array for demo mode
      if (
        errorText.includes("Invalid token") ||
        errorText.includes("Missing token")
      ) {
        console.warn(
          "Backend requires valid authentication, returning empty therapies list for demo mode"
        );
        return [];
      }

      throw new Error(
        `Failed to fetch therapies: ${res.status} - ${errorText}`
      );
    }

    return res.json();
  } catch (error: unknown) {
    console.error("Error fetching therapies:", error);
    // Return empty array for demo mode when backend is down
    if (
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("500")
    ) {
      console.warn(
        "Backend unavailable, returning empty therapies list for demo mode"
      );
      return [];
    }
    throw error;
  }
}

// Admin: Create therapy
export async function createTherapy(
  data: {
    name: string;
    description?: string;
    durationMinutes: number;
    price?: number;
    category?: string;
    status?: string;
    requirements?: string;
    venueAddress?: string;
  },
  token: string
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";
  const res = await fetch(`${apiBase}/api/therapies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Failed to create therapy: ${res.status}`);
  return res.json();
}

// Admin: Update therapy
export async function updateTherapy(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    durationMinutes: number;
    price: number;
    category: string;
    status: string;
    requirements: string;
    venueAddress: string;
  }>,
  token: string
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";
  const res = await fetch(`${apiBase}/api/therapies/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Failed to update therapy: ${res.status}`);
  return res.json();
}

// Admin: Delete therapy
export async function deleteTherapy(id: string, token: string) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";
  const res = await fetch(`${apiBase}/api/therapies/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Failed to delete therapy: ${res.status}`);
  return res.json();
}

// Progress API functions
export async function getPatientProgress(patientId: string, token: string) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  try {
    const res = await fetch(`${apiBase}/api/progress/patient/${patientId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          token && token.includes(".") ? token : patientId
        }`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch progress data: ${res.status}`);
    }

    return res.json();
  } catch (error: unknown) {
    console.error("Error fetching progress data:", error);
    throw error;
  }
}

export async function updateSessionFeedback(
  sessionId: string,
  feedback: {
    rating?: number;
    notes?: string;
    painLevel?: number;
    energyLevel?: number;
    moodLevel?: number;
    sleepQuality?: number;
    overallWellness?: number;
  },
  token: string,
  uidFallback?: string
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  try {
    const res = await fetch(
      `${apiBase}/api/progress/session/${sessionId}/feedback`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            token && token.includes(".") ? token : uidFallback || token
          }`,
        },
        body: JSON.stringify(feedback),
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to update session feedback: ${res.status}`);
    }

    return res.json();
  } catch (error: unknown) {
    console.error("Error updating session feedback:", error);
    throw error;
  }
}

export async function getPatientGoals(patientId: string, token: string) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  try {
    const res = await fetch(
      `${apiBase}/api/progress/patient/${patientId}/goals`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            token && token.includes(".") ? token : patientId
          }`,
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch goals: ${res.status}`);
    }

    return res.json();
  } catch (error: unknown) {
    console.error("Error fetching goals:", error);
    throw error;
  }
}

export async function getPatientAchievements(patientId: string, token: string) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  try {
    const res = await fetch(
      `${apiBase}/api/progress/patient/${patientId}/achievements`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            token && token.includes(".") ? token : patientId
          }`,
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch achievements: ${res.status}`);
    }

    return res.json();
  } catch (error: unknown) {
    console.error("Error fetching achievements:", error);
    throw error;
  }
}

export async function getPatientNotifications(
  patientId: string,
  token: string
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  try {
    const res = await fetch(
      `${apiBase}/api/notifications/patient/${patientId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            token && token.includes(".") ? token : patientId
          }`,
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch notifications: ${res.status}`);
    }

    return res.json() as Promise<{
      pre: Array<Record<string, unknown>>;
      post: Array<Record<string, unknown>>;
    }>;
  } catch (error: unknown) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

// Messages API
export async function listMessageThreads(patientId: string, token?: string) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  const authHeaders = getAuthHeader(token, null);
  console.log("Auth headers for message threads:", authHeaders);

  try {
    const res = await fetch(
      `${apiBase}/api/messages/threads/patient/${patientId}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Backend error ${res.status}:`, errorText);

      // If it's a token error, return empty array for demo mode
      if (
        errorText.includes("Invalid token") ||
        errorText.includes("Missing token")
      ) {
        console.warn(
          "Backend requires valid authentication, returning empty threads list for demo mode"
        );
        return [];
      }

      throw new Error(`Failed to load threads: ${res.status} - ${errorText}`);
    }

    return res.json() as Promise<
      Array<{ chatId: string; doctor: Record<string, unknown> }>
    >;
  } catch (error: unknown) {
    console.error("Error fetching message threads:", error);
    // Return empty array for demo mode when backend is down
    if (
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("500")
    ) {
      console.warn(
        "Backend unavailable, returning empty threads list for demo mode"
      );
      return [];
    }
    throw error;
  }
}

export async function listChatMessages(
  chatId: string,
  token?: string,
  uidFallback?: string
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  const authHeaders = getAuthHeader(token, uidFallback);
  console.log("Auth headers for chat messages:", authHeaders);

  try {
    const res = await fetch(
      `${apiBase}/api/messages/threads/${chatId}/messages`,
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Backend error ${res.status}:`, errorText);

      // If it's a token error, return empty messages for demo mode
      if (
        errorText.includes("Invalid token") ||
        errorText.includes("Missing token")
      ) {
        console.warn(
          "Backend requires valid authentication, returning empty messages for demo mode"
        );
        return {
          chatId,
          participants: [],
          messages: [],
        };
      }

      throw new Error(`Failed to load messages: ${res.status} - ${errorText}`);
    }

    return res.json() as Promise<{
      chatId: string;
      participants: Record<string, unknown>[];
      messages: Record<string, unknown>[];
    }>;
  } catch (error: unknown) {
    console.error("Error loading chat messages:", error);

    // Return empty messages for demo mode when backend is down
    if (
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("500")
    ) {
      console.warn(
        "Backend unavailable, returning empty messages for demo mode"
      );
      return {
        chatId,
        participants: [],
        messages: [],
      };
    }

    throw error;
  }
}

export async function sendChatMessage(
  chatId: string,
  data: { senderId: string; text?: string; attachmentUrl?: string; mediaUrls?: string[]; replyTo?: string },
  token?: string
) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";

  const authHeaders = getAuthHeader(token, null);
  console.log("Auth headers for sending message:", authHeaders);

  try {
    const res = await fetch(
      `${apiBase}/api/messages/threads/${chatId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Backend error ${res.status}:`, errorText);

      // If it's a token error, return a mock response for demo mode
      if (
        errorText.includes("Invalid token") ||
        errorText.includes("Missing token")
      ) {
        console.warn(
          "Backend requires valid authentication, returning mock message for demo mode"
        );
        return {
          chatId,
          messages: [
            {
              _id: `demo-msg-${Date.now()}`,
              text: data.text || "Demo message",
              senderId: data.senderId,
              createdAt: new Date().toISOString(),
              isDemo: true,
            },
          ],
        };
      }

      throw new Error(`Failed to send message: ${res.status} - ${errorText}`);
    }

    return res.json() as Promise<{
      chatId: string;
      messages: Record<string, unknown>[];
    }>;
  } catch (error: unknown) {
    console.error("Error sending message:", error);

    // Return mock response for demo mode when backend is down
    if (
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("500")
    ) {
      console.warn("Backend unavailable, returning mock message for demo mode");
      return {
        chatId,
        messages: [
          {
            _id: `demo-msg-${Date.now()}`,
            text: data.text || "Demo message",
            senderId: data.senderId,
            createdAt: new Date().toISOString(),
            isDemo: true,
          },
        ],
      };
    }

    throw error;
  }
}

// Doctor-Admin thread for a given doctor (uid or id)
export async function getDoctorAdminThread(doctorId: string, token: string) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";
  const res = await fetch(
    `${apiBase}/api/messages/threads/doctor-admin/${doctorId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(10000),
    }
  );
  if (!res.ok) throw new Error(`Failed to get admin thread: ${res.status}`);
  return res.json() as Promise<{ chatId: string }>;
}

export async function listDoctorThreads(doctorId: string, token: string) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE || "https://ayurs-care-api.vercel.app";
  const res = await fetch(
    `${apiBase}/api/messages/threads/doctor/${doctorId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(10000),
    }
  );
  if (!res.ok) throw new Error(`Failed to load doctor threads: ${res.status}`);
  return res.json() as Promise<
    Array<{ chatId: string; patient: Record<string, unknown> }>
  >;
}
