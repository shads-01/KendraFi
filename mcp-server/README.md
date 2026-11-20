# KendraFi MCP Server

Stdio MCP bridge for the KendraFi syndicate FSM. Tools:

- `run_scenario(A|B|C)` — executes the 5-state LangGraph FSM in-process
- `get_trace(A|B|C)` — returns the exported JSON state trace
- `get_backtest_summary()` — Monte Carlo headline metrics

Install the SDK: `pip install mcp`

Run: `python mcp-server/kendrafi_mcp.py` (from the repo root, stdio transport)

Connect from any MCP client (OpenCode, Claude Desktop, Cursor). In OpenCode the
server is already registered in `opencode.jsonc` under `mcp.kendrafi`.
