import { tools } from "../src/lib/tools";

async function runTests() {
  console.log(`Starting automated test for all ${tools.length} lab tools/modules...\n`);

  let passed = 0;
  let failed = 0;
  const issues: string[] = [];

  for (const tool of tools) {
    const inputMap = Object.fromEntries(tool.fields.map(f => [f.name, f.default]));
    const getVal = (name: string) => inputMap[name] ?? "";

    try {
      const result = await tool.run(getVal);

      if (result.error) {
        console.error(`❌ [${tool.id}] returned error: "${result.error}"`);
        issues.push(`Tool ${tool.id} default error: ${result.error}`);
        failed++;
      } else if (!result.output && !result.visual) {
        console.warn(`⚠️ [${tool.id}] returned completely empty output and no visual`);
        issues.push(`Tool ${tool.id} returned empty output & no visual`);
        failed++;
      } else {
        const visualType = result.visual?.type ?? "none";
        const hasTrace = Boolean(result.trace && result.trace.length > 0);
        console.log(`✅ [${tool.id}] (${tool.trackId}) - Visual: ${visualType}, Trace: ${hasTrace}, OutLen: ${result.output.length}`);
        passed++;
      }
    } catch (err: any) {
      console.error(`💥 [${tool.id}] threw uncaught exception:`, err?.message || err);
      issues.push(`Tool ${tool.id} threw exception: ${err?.message || err}`);
      failed++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Total: ${tools.length} | Passed: ${passed} | Issues: ${failed}`);
  console.log(`========================================\n`);

  if (issues.length > 0) {
    console.log("Issues found:");
    for (const issue of issues) {
      console.log("- " + issue);
    }
  }
}

runTests().catch(console.error);
