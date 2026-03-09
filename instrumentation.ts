export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const proxyUrl =
      process.env.GLOBAL_AGENT_HTTPS_PROXY ||
      process.env.GLOBAL_AGENT_HTTP_PROXY ||
      process.env.HTTPS_PROXY ||
      process.env.HTTP_PROXY;

    if (proxyUrl) {
      const { ProxyAgent, setGlobalDispatcher } = await import("undici");
      setGlobalDispatcher(new ProxyAgent({ uri: proxyUrl }));
    }
  }
}
