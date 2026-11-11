async function testEndpoints() {
  const requests = [
    { name: "POST /posts/1/vote (first time)", url: "http://localhost:3000/posts/1/vote" },
    { name: "POST /posts/1/vote (same user again)", url: "http://localhost:3000/posts/1/vote" },
    { name: "POST /posts/999999/vote", url: "http://localhost:3000/posts/999999/vote" },
    { name: "POST /posts/abc/vote", url: "http://localhost:3000/posts/abc/vote" },
  ];

  console.log("--------------------------------------------------------------------------------");
  console.log("Endpoint Test Results");
  console.log("--------------------------------------------------------------------------------");

  for (const r of requests) {
    try {
      const res = await fetch(r.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => null);
      console.log(`Request:  ${r.name}`);
      console.log(`Status:   ${res.status} ${res.statusText}`);
      console.log(`Response: ${JSON.stringify(data)}`);
      console.log("--------------------------------------------------------------------------------");
    } catch (err) {
      console.error(`Request failed: ${r.name}`, err);
    }
  }
}

testEndpoints();
