/* eslint-disable no-console */
const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:5000';

const checks = [
  {
    name: 'Home data: slides',
    run: async () => {
      const res = await fetch(`${BASE_URL}/slides/public`);
      if (!res.ok) throw new Error(`Expected 2xx, got ${res.status}`);
    }
  },
  {
    name: 'Home data: featured graduates',
    run: async () => {
      const res = await fetch(`${BASE_URL}/graduates-showcase/featured`);
      if (!res.ok) throw new Error(`Expected 2xx, got ${res.status}`);
    }
  },
  {
    name: 'Home data: FAQs',
    run: async () => {
      const res = await fetch(`${BASE_URL}/faq/published`);
      if (!res.ok) throw new Error(`Expected 2xx, got ${res.status}`);
    }
  },
  {
    name: 'Home data: public stats',
    run: async () => {
      const res = await fetch(`${BASE_URL}/users/stats/public`);
      if (!res.ok) throw new Error(`Expected 2xx, got ${res.status}`);
      const body = await res.json();
      if (typeof body.verified !== 'number') throw new Error('Invalid stats payload');
    }
  },
  {
    name: 'Register validation path reachable',
    run: async () => {
      const res = await fetch(`${BASE_URL}/auth/register`, { method: 'POST' });
      if (res.status !== 400 && res.status !== 415) {
        throw new Error(`Expected validation/media rejection, got ${res.status}`);
      }
    }
  },
  {
    name: 'Login path reachable (OTP request validation)',
    run: async () => {
      const res = await fetch(`${BASE_URL}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalid-email' })
      });
      if (res.status !== 400) {
        throw new Error(`Expected 400 validation, got ${res.status}`);
      }
    }
  }
];

const main = async () => {
  console.log(`Running smoke checks against ${BASE_URL}`);
  let failed = 0;

  for (const check of checks) {
    const started = Date.now();
    try {
      await check.run();
      console.log(`PASS - ${check.name} (${Date.now() - started}ms)`);
    } catch (err) {
      failed += 1;
      console.error(`FAIL - ${check.name}: ${err.message}`);
    }
  }

  if (failed > 0) {
    console.error(`Smoke test finished with ${failed} failure(s).`);
    process.exit(1);
  }

  console.log('Smoke test passed.');
};

main().catch((err) => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});
