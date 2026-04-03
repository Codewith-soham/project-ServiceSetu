import process from "process";

const BASE_URL = (process.env.API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");
const TEST_RUN_ID = Math.random().toString(36).slice(2, 8);
const REQUEST_TIMEOUT_MS = Number(process.env.TEST_REQUEST_TIMEOUT_MS || 15000);

const DEFAULT_PASSWORD = process.env.TEST_PASSWORD || "Test@12345";
const CUSTOMER_ADDRESS = process.env.TEST_CUSTOMER_ADDRESS || "Andheri West, Mumbai, Maharashtra, India";
const PROVIDER_ADDRESS = process.env.TEST_PROVIDER_ADDRESS || "Powai, Mumbai, Maharashtra, India";
const DEFAULT_SERVICE_TYPE = (process.env.TEST_SERVICE_TYPE || "electrician").toLowerCase();
const NEARBY_LAT = process.env.TEST_NEARBY_LAT || "28.6";
const NEARBY_LON = process.env.TEST_NEARBY_LON || "77.2";
const NEARBY_RADIUS = process.env.TEST_NEARBY_RADIUS || "10";

const summary = {
  passed: 0,
  failed: 0,
  skipped: 0,
};

function logPass(message) {
  summary.passed += 1;
  console.log(`PASS  ${message}`);
}

function logFail(message) {
  summary.failed += 1;
  console.log(`FAIL  ${message}`);
}

function logSkip(reason) {
  summary.skipped += 1;
  console.log(`SKIP  ${reason}`);
}

function unwrapResponseData(response) {
  return response?.data?.data ?? response?.data ?? null;
}

function toJsonBody(payload) {
  return JSON.stringify(payload);
}

function createPersona(role) {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const safeStamp = stamp.replace(/[^a-z0-9-]/gi, "");

  return {
    role,
    fullname: `${role.charAt(0).toUpperCase()}${role.slice(1)} ${safeStamp}`,
    username: `${role}_${safeStamp}`.toLowerCase(),
    email: `${role}.${safeStamp}@example.com`.toLowerCase(),
    phone: `${role}-${safeStamp}`,
    password: DEFAULT_PASSWORD,
    address: role === "provider" ? PROVIDER_ADDRESS : CUSTOMER_ADDRESS,
  };
}

function futureIsoDate(daysAhead = 1) {
  return new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();
}

async function request({ method = "GET", path, token, body }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const startedAt = Date.now();

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? toJsonBody(body) : undefined,
      credentials: "include",
      signal: controller.signal,
    });

    const duration = Date.now() - startedAt;
    const text = await response.text();

    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      duration,
      data,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function runTest(label, fn) {
  try {
    const startedAt = Date.now();
    const result = await fn();

    if (result?.skip) {
      logSkip(result.skip);
      return { skipped: true };
    }

    if (!result || typeof result.status !== "number") {
      throw new Error("test function did not return a response object");
    }

    const expectedStatuses = result.expectedStatuses || [200];
    if (!expectedStatuses.includes(result.status)) {
      logFail(`${label} -> ${result.status}`);
      return { ok: false, ...result };
    }

    if (typeof result.validate === "function") {
      const validation = result.validate(result);
      if (validation !== true) {
        throw new Error(typeof validation === "string" ? validation : "validation failed");
      }
    }

    const duration = Date.now() - startedAt;
    logPass(`${label} -> ${result.status} (${duration}ms)`);
    return { ok: true, ...result, duration };
  } catch (error) {
    const message = error?.name === "AbortError"
      ? `request timed out after ${REQUEST_TIMEOUT_MS}ms`
      : error?.message || "unknown error";
    logFail(`${label} -> request error: ${message}`);
    return { ok: false, error };
  }
}

async function runJsonTest({ label, method, path, token, body, expectedStatuses, validate }) {
  return runTest(label, async () => {
    const response = await request({ method, path, token, body });
    return {
      ...response,
      expectedStatuses,
      validate,
    };
  });
}

async function bootstrapRegisteredPersona(role, loginMode = "email") {
  const persona = createPersona(role);

  const registerResult = await runJsonTest({
    label: `POST /auth/register (${role})`,
    method: "POST",
    path: "/auth/register",
    body: persona,
    expectedStatuses: [200, 201],
    validate: (result) => {
      const data = unwrapResponseData(result);
      return data?._id ? true : "registration response did not include a created user";
    },
  });

  if (!registerResult.ok) {
    return { persona, ready: false, token: null, user: null, skipReason: `registration failed for ${role}` };
  }

  await runJsonTest({
    label: `POST /auth/register duplicate (${role})`,
    method: "POST",
    path: "/auth/register",
    body: persona,
    expectedStatuses: [400],
  });

  await runJsonTest({
    label: `POST /auth/login wrong password (${role})`,
    method: "POST",
    path: "/auth/login",
    body: loginMode === "phone"
      ? { phone: persona.phone, password: "wrong-password" }
      : { email: persona.email, password: "wrong-password" },
    expectedStatuses: [400],
  });

  const loginResult = await runJsonTest({
    label: `POST /auth/login (${role})`,
    method: "POST",
    path: "/auth/login",
    body: loginMode === "phone"
      ? { phone: persona.phone, password: persona.password }
      : { email: persona.email, password: persona.password },
    expectedStatuses: [200],
    validate: (result) => {
      const data = unwrapResponseData(result);
      return data?.accessToken ? true : "login response did not include an access token";
    },
  });

  const loginData = unwrapResponseData(loginResult);

  return {
    persona,
    ready: loginResult.ok,
    token: loginData?.accessToken || null,
    user: loginData?.user || null,
    skipReason: loginResult.ok ? null : `login failed for ${role}`,
  };
}

async function loginConfiguredAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const phone = process.env.ADMIN_PHONE;
  const password = process.env.ADMIN_PASSWORD;

  if (!password || (!email && !phone)) {
    return { ready: false, token: null, skipReason: "admin credentials not configured" };
  }

  const loginResult = await runJsonTest({
    label: "POST /auth/login (admin)",
    method: "POST",
    path: "/auth/login",
    body: phone
      ? { phone, password }
      : { email, password },
    expectedStatuses: [200],
    validate: (result) => {
      const data = unwrapResponseData(result);
      return data?.accessToken ? true : "admin login did not return an access token";
    },
  });

  const loginData = unwrapResponseData(loginResult);

  return {
    ready: loginResult.ok,
    token: loginData?.accessToken || null,
    user: loginData?.user || null,
    skipReason: loginResult.ok ? null : "admin login failed",
  };
}

async function upgradeProviderPersona(providerPersona) {
  if (!providerPersona?.token) {
    return { ...providerPersona, providerReady: false, providerId: null, skipReason: "provider token unavailable" };
  }

  const upgradeResult = await runJsonTest({
    label: "POST /providers/become (provider persona)",
    method: "POST",
    path: "/providers/become",
    token: providerPersona.token,
    body: {
      serviceType: DEFAULT_SERVICE_TYPE,
      serviceCategory: DEFAULT_SERVICE_TYPE,
      hourlyRate: 500,
      serviceDescription: "Smoke test provider onboarding",
      address: PROVIDER_ADDRESS,
    },
    expectedStatuses: [200, 201],
    validate: (result) => {
      const data = unwrapResponseData(result);
      return data?._id ? true : "provider onboarding did not return a provider document";
    },
  });

  if (!upgradeResult.ok) {
    return { ...providerPersona, providerReady: false, providerId: null, skipReason: "provider onboarding failed" };
  }

  const providerData = unwrapResponseData(upgradeResult);

  const reloginResult = await runJsonTest({
    label: "POST /auth/login after provider upgrade",
    method: "POST",
    path: "/auth/login",
    body: {
      phone: providerPersona.persona.phone,
      password: providerPersona.persona.password,
    },
    expectedStatuses: [200],
    validate: (result) => {
      const data = unwrapResponseData(result);
      return data?.accessToken ? true : "provider relogin did not return an access token";
    },
  });

  const reloginData = unwrapResponseData(reloginResult);

  return {
    ...providerPersona,
    ready: reloginResult.ok,
    token: reloginData?.accessToken || providerPersona.token,
    user: reloginData?.user || providerPersona.user,
    providerReady: reloginResult.ok,
    providerId: providerData?._id || providerData?.id || null,
    providerDoc: providerData,
    skipReason: reloginResult.ok ? null : "provider relogin failed",
  };
}

async function getPriceForServiceType(serviceType) {
  const discoveryResult = await runJsonTest({
    label: `GET /getProviders/provider?serviceType=${serviceType}`,
    method: "GET",
    path: `/getProviders/provider?serviceType=${encodeURIComponent(serviceType)}`,
    expectedStatuses: [200],
    validate: (result) => Array.isArray(unwrapResponseData(result)) ? true : "provider discovery should return an array",
  });

  const providers = unwrapResponseData(discoveryResult) || [];
  return providers.find((provider) => provider?.serviceType === serviceType)?.price ?? null;
}

async function main() {
  console.log(`API test runner started with base URL: ${BASE_URL}`);
  console.log(`Test run id: ${TEST_RUN_ID}`);

  let customerPersona = null;
  let providerPersona = null;
  let adminPersona = null;

  let providerId = null;
  let bookingId = null;

  console.log("\n=== Guest / Public Smoke ===");
  await runJsonTest({
    label: "GET /healthCheck",
    method: "GET",
    path: "/healthCheck",
    expectedStatuses: [200],
  });

  await runJsonTest({
    label: "GET /healthCheck/test",
    method: "GET",
    path: "/healthCheck/test",
    expectedStatuses: [200],
  });

  await runJsonTest({
    label: "GET /users/profile without token",
    method: "GET",
    path: "/users/profile",
    expectedStatuses: [401],
  });

  await runJsonTest({
    label: "GET /bookings/provider-bookings without token",
    method: "GET",
    path: "/bookings/provider-bookings",
    expectedStatuses: [401],
  });

  console.log("\n=== Persona Bootstrap ===");
  customerPersona = await bootstrapRegisteredPersona("customer", "email");
  providerPersona = await bootstrapRegisteredPersona("provider", "phone");

  if (customerPersona.ready) {
    logPass("Customer persona ready for workflow checks");
  } else {
    logSkip(customerPersona.skipReason || "Customer persona bootstrap failed");
  }

  if (providerPersona.ready) {
    logPass("Provider persona ready for workflow checks");
  } else {
    logSkip(providerPersona.skipReason || "Provider persona bootstrap failed");
  }

  adminPersona = await loginConfiguredAdmin();
  if (adminPersona.ready) {
    logPass("Admin persona ready for optional workflow checks");
  } else {
    logSkip(adminPersona.skipReason || "Admin persona not configured");
  }

  if (customerPersona.ready) {
    await runJsonTest({
      label: "GET /users/profile with customer token",
      method: "GET",
      path: "/users/profile",
      token: customerPersona.token,
      expectedStatuses: [200],
      validate: (result) => unwrapResponseData(result)?._id ? true : "profile response missing user data",
    });
  } else {
    logSkip("Customer-dependent tests skipped because customer persona failed to bootstrap");
  }

  if (providerPersona.ready) {
    providerPersona = await upgradeProviderPersona(providerPersona);
    providerId = providerPersona.providerId;

    if (providerPersona.providerReady) {
      logPass("Provider persona upgraded and relogged in successfully");
    } else {
      logSkip(providerPersona.skipReason || "Provider onboarding failed");
    }
  }

  console.log("\n=== Provider Discovery ===");
  const publicProvidersResult = await runJsonTest({
    label: "GET /getProviders/provider",
    method: "GET",
    path: "/getProviders/provider",
    expectedStatuses: [200],
    validate: (result) => Array.isArray(unwrapResponseData(result)) ? true : "provider list should be an array",
  });

  const filteredProvidersResult = await runJsonTest({
    label: `GET /getProviders/provider?serviceType=${DEFAULT_SERVICE_TYPE}`,
    method: "GET",
    path: `/getProviders/provider?serviceType=${encodeURIComponent(DEFAULT_SERVICE_TYPE)}`,
    expectedStatuses: [200],
    validate: (result) => Array.isArray(unwrapResponseData(result)) ? true : "filtered provider list should be an array",
  });

  await runJsonTest({
    label: "GET /providers/nearby?lat=28.6&lon=77.2&radius=10",
    method: "GET",
    path: `/providers/nearby?lat=${encodeURIComponent(NEARBY_LAT)}&lon=${encodeURIComponent(NEARBY_LON)}&radius=${encodeURIComponent(NEARBY_RADIUS)}&serviceType=${encodeURIComponent(DEFAULT_SERVICE_TYPE)}`,
    expectedStatuses: [200],
    validate: (result) => Array.isArray(unwrapResponseData(result)) ? true : "nearby provider list should be an array",
  });

  const filteredProviders = unwrapResponseData(filteredProvidersResult) || [];
  const listedProvider = filteredProviders.find((provider) => provider?.serviceType === DEFAULT_SERVICE_TYPE)
    || (unwrapResponseData(publicProvidersResult) || []).find((provider) => provider?.serviceType === DEFAULT_SERVICE_TYPE)
    || null;

  const bookingPrerequisiteReady = typeof listedProvider?.price === "number";

  if (!providerId) {
    providerId = providerPersona?.providerId || listedProvider?.id || listedProvider?._id || null;
  }

  if (!providerId) {
    logSkip("No providerId available for booking and review workflows");
  }

  if (!bookingPrerequisiteReady) {
    logSkip("Booking, completion, and review workflows skipped because the service catalog has no seeded price for the discovered provider type");
  }

  console.log("\n=== Customer Workflow ===");
  if (customerPersona.ready && providerId && bookingPrerequisiteReady) {
    const bookingResult = await runJsonTest({
      label: "POST /bookings/create",
      method: "POST",
      path: "/bookings/create",
      token: customerPersona.token,
      body: {
        providerId,
        serviceCategory: DEFAULT_SERVICE_TYPE,
        bookingDate: futureIsoDate(1),
        bookingTime: "10:00",
        durationHours: 2,
        note: "Smoke test booking",
      },
      expectedStatuses: [200, 201],
      validate: (result) => unwrapResponseData(result)?._id ? true : "booking creation did not return a booking document",
    });

    const bookingData = unwrapResponseData(bookingResult);
    bookingId = bookingData?._id || bookingData?.id || null;
  } else {
    logSkip("Customer booking workflow skipped because customer persona, providerId, or service price prerequisite is unavailable");
  }

  console.log("\n=== Provider Workflow ===");
  if (providerPersona.ready && providerPersona.providerReady && bookingId) {
    await runJsonTest({
      label: "GET /bookings/provider-bookings",
      method: "GET",
      path: "/bookings/provider-bookings",
      token: providerPersona.token,
      expectedStatuses: [200],
      validate: (result) => Array.isArray(unwrapResponseData(result)) ? true : "provider bookings should be an array",
    });

    await runJsonTest({
      label: "PATCH /bookings/:bookingId/status",
      method: "PATCH",
      path: `/bookings/${bookingId}/status`,
      token: providerPersona.token,
      body: { status: "accepted" },
      expectedStatuses: [200],
    });

    await runJsonTest({
      label: "PATCH /bookings/:bookingId/complete-by-provider",
      method: "PATCH",
      path: `/bookings/${bookingId}/complete-by-provider`,
      token: providerPersona.token,
      expectedStatuses: [200],
    });
  } else {
    logSkip("Provider workflow skipped because provider persona, provider onboarding, or bookingId is unavailable");
  }

  console.log("\n=== Completion And Review ===");
  if (customerPersona.ready && bookingId) {
    await runJsonTest({
      label: "PATCH /bookings/:bookingId/confirm-completion",
      method: "PATCH",
      path: `/bookings/${bookingId}/confirm-completion`,
      token: customerPersona.token,
      expectedStatuses: [200],
    });
  } else {
    logSkip("Customer completion step skipped because customer token or bookingId is unavailable");
  }

  if (customerPersona.ready && providerId && bookingId) {
    await runJsonTest({
      label: "POST /reviews",
      method: "POST",
      path: "/reviews",
      token: customerPersona.token,
      body: {
        providerId,
        bookingId,
        rating: 5,
        comment: `Excellent service from smoke test ${TEST_RUN_ID}`,
        review: `Excellent service from smoke test ${TEST_RUN_ID}`,
      },
      expectedStatuses: [200, 201],
    });

    await runJsonTest({
      label: "GET /reviews/:providerId",
      method: "GET",
      path: `/reviews/${providerId}`,
      expectedStatuses: [200],
      validate: (result) => Array.isArray(unwrapResponseData(result)) ? true : "provider reviews should be an array",
    });
  } else {
    logSkip("Review workflow skipped because customer persona, providerId, or bookingId is unavailable");
  }

  console.log("\n=== Role Guards ===");
  if (customerPersona.ready) {
    await runJsonTest({
      label: "GET /users/profile (customer token)",
      method: "GET",
      path: "/users/profile",
      token: customerPersona.token,
      expectedStatuses: [200],
      validate: (result) => unwrapResponseData(result)?._id ? true : "profile response missing user data",
    });

    if (bookingId) {
      logSkip("GET /bookings/:bookingId is not implemented in the current codebase; using /bookings/user-bookings instead");

      await runJsonTest({
        label: "GET /bookings/user-bookings (customer token)",
        method: "GET",
        path: "/bookings/user-bookings",
        token: customerPersona.token,
        expectedStatuses: [200],
        validate: (result) => Array.isArray(unwrapResponseData(result)) ? true : "customer bookings should be an array",
      });
    } else {
      logSkip("Booking role-guard check skipped because bookingId is unavailable");
    }
  } else {
    logSkip("Role guard checks skipped because customer persona is unavailable");
  }

  console.log("\n=== Admin Workflow ===");
  if (adminPersona.ready) {
    const currentPrice = await getPriceForServiceType(DEFAULT_SERVICE_TYPE);

    if (typeof currentPrice !== "number") {
      logSkip("Admin pricing workflow skipped because no current price could be resolved from provider listings");
    } else {
      const updatedPrice = currentPrice + 1;

      await runJsonTest({
        label: "PUT /admin/services/price",
        method: "PUT",
        path: "/admin/services/price",
        token: adminPersona.token,
        body: {
          serviceType: DEFAULT_SERVICE_TYPE,
          price: updatedPrice,
        },
        expectedStatuses: [200],
        validate: (result) => unwrapResponseData(result)?.price === updatedPrice ? true : "admin price update did not persist the new value",
      });

      await runJsonTest({
        label: "PUT /admin/services/price restore",
        method: "PUT",
        path: "/admin/services/price",
        token: adminPersona.token,
        body: {
          serviceType: DEFAULT_SERVICE_TYPE,
          price: currentPrice,
        },
        expectedStatuses: [200],
      });
    }
  } else {
    logSkip(adminPersona.skipReason || "Admin workflow skipped because credentials were not provided");
  }

  console.log("\n=== Summary ===");
  console.log(`Passed : ${summary.passed}`);
  console.log(`Failed : ${summary.failed}`);
  console.log(`Skipped: ${summary.skipped}`);

  if (summary.failed > 0) {
    process.exitCode = 1;
  }
}

main();
