import { headers } from "next/headers";

import { TopNav } from "@/app/TopNav";

const TOOLS = [
  {
    name: "list_participants",
    description: "Returns the current list of tournament participants.",
  },
  {
    name: "add_participant",
    description:
      "Adds a new participant by username. Errors if the username already exists.",
  },
  {
    name: "remove_participant",
    description: "Removes a participant by username. Errors if not found.",
  },
  {
    name: "reorder_participants",
    description:
      "Reorders the participant list. The full list must be provided in the desired order.",
  },
  {
    name: "get_tournament_state",
    description:
      "Returns the current tournament configuration: name, description, and round length in minutes.",
  },
  {
    name: "get_results",
    description:
      "Returns per-participant results for the current or last round, sorted by finish time. Shows elapsed seconds, DNF status, and points earned this round.",
  },
  {
    name: "set_tournament_name",
    description: "Sets the tournament name.",
  },
  {
    name: "set_tournament_description",
    description: "Sets the tournament description. Markdown is supported.",
  },
  {
    name: "set_round_length",
    description: "Sets the round duration in minutes.",
  },
];

const EXAMPLE_PROMPTS = [
  "List all tournament participants",
  "Add Alice and Bob to the tournament",
  "Remove Charlie from the participants",
  "What is the current tournament name and description?",
  "Show me the results from the last round",
  "Set the round length to 15 minutes",
];

const STEPS = [
  "Go to claude.ai and open Settings",
  'Navigate to "Connectors"',
  'Click "+" then "Add custom connector"',
  "Paste the server URL above and click Add",
  'Enable it per conversation via the "+" button → Connectors',
];

export default async function McpPage() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const MCP_URL = `${proto}://${host}/api/mcp`;

  return (
    <>
      <TopNav />
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="text-2xl font-bold mb-2">MCP Server</h1>
          <p className="text-muted-foreground">
            Connect your AI assistant to manage the tournament directly.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="font-semibold">Server URL</h2>
          <pre className="bg-muted rounded-md px-4 py-3 text-sm font-mono overflow-x-auto">
            {MCP_URL}
          </pre>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold">How to connect</h2>
          <ol className="space-y-2">
            {STEPS.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground font-mono text-xs">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          <p className="text-xs text-muted-foreground pt-1">
            Works on claude.ai (Free, Pro, Max, Team, Enterprise) and Claude
            Desktop.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold">Example prompts</h2>
          <div className="flex flex-col gap-2">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <div
                key={prompt}
                className="bg-muted rounded-md px-4 py-2.5 text-sm font-mono"
              >
                {prompt}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold">Available Tools</h2>
          <div className="divide-y divide-border rounded-md border border-border">
            {TOOLS.map((tool) => (
              <div key={tool.name} className="px-4 py-3">
                <code className="text-sm font-mono font-medium">
                  {tool.name}
                </code>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {tool.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
