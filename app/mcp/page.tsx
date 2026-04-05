import { TopNav } from "@/app/TopNav";

const MCP_URL = "https://mysteeri.hevirinki.fi/api/mcp";

const CLAUDE_DESKTOP_CONFIG = JSON.stringify(
  {
    mcpServers: {
      "mystery-tournament": {
        type: "http",
        url: MCP_URL,
      },
    },
  },
  null,
  2,
);

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
];

export default function McpPage() {
  return (
    <>
      <TopNav />
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="text-2xl font-bold mb-2">MCP Server</h1>
          <p className="text-muted-foreground">
            Connect your AI assistant to manage tournament participants
            directly.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="font-semibold">Server URL</h2>
          <pre className="bg-muted rounded-md px-4 py-3 text-sm font-mono overflow-x-auto">
            {MCP_URL}
          </pre>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold">Claude Desktop</h2>
          <p className="text-sm text-muted-foreground">
            Add this to your{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              claude_desktop_config.json
            </code>
            :
          </p>
          <pre className="bg-muted rounded-md px-4 py-3 text-sm font-mono overflow-x-auto">
            {CLAUDE_DESKTOP_CONFIG}
          </pre>
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
