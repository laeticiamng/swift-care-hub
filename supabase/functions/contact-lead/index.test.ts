import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/contact-lead`;

const validLead = {
  lastName: "Dupont",
  firstName: "Marie",
  email: `test-${Date.now()}@example.com`,
  establishment: "CHU Test",
  roleFunction: "DSI",
  passagesVolume: "30000",
  message: "Test lead from automated QA",
};

Deno.test("B2B Lead — valid submission returns 200", async () => {
  const resp = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(validLead),
  });
  const data = await resp.json();
  assertEquals(resp.status, 200);
  assertEquals(data.success, true);
});

Deno.test("B2B Lead — duplicate email within 24h returns 429", async () => {
  // Use same email as previous test
  const resp = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(validLead),
  });
  const data = await resp.json();
  assertEquals(resp.status, 429);
  assertExists(data.error);
});

Deno.test("B2B Lead — missing required fields returns 400", async () => {
  const resp = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email: "test@test.com" }),
  });
  const data = await resp.json();
  assertEquals(resp.status, 400);
  assertExists(data.error);
});

Deno.test("B2B Lead — invalid email returns 400", async () => {
  const resp = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      ...validLead,
      email: "not-an-email",
    }),
  });
  const data = await resp.json();
  assertEquals(resp.status, 400);
  assertExists(data.error);
});

Deno.test("B2B Lead — different email succeeds", async () => {
  const resp = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      ...validLead,
      email: `test2-${Date.now()}@example.com`,
    }),
  });
  const data = await resp.json();
  assertEquals(resp.status, 200);
  assertEquals(data.success, true);
});
