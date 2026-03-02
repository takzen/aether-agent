# Terminal Guide (Slash Commands)

The terminal in the Aethera Dashboard is not just a chat – it's a powerful diagnostic and operational tool. Below is a list of available commands.

## Available Commands

### `/logs [limit]`
Displays the latest entries from the system event log (System Logs).
- **Example:** `/logs 20`
- **Usage:** Error diagnostics, viewing recent Agent actions.

### `/clear`
Clears all history visible in the terminal window.
- **Usage:** Tidying up the workspace before a new task.

### `/logclear`
Permanently deletes all telemetry history from the system database.
- **Usage:** Resolving "Duplicate Keys" issue after many days of operation, refreshing the logs database.
- **Warning:** Irreversible operation.

### `/simulate`
Launches the **Active World Model (AWM)**. The Agent analyzes logs from the last 30 minutes and generates proactive insights on the direction of work.
- **Status:** Requires min. 5 logs for proper operation.
- **Result:** Insight (conclusion) + Suggested Action (recommendation).

## 💡 Autocomplete Features
- Type `/`, to evoke the suggestion list.
- Use the **Up/Down** arrows, to navigate the list.
- Press **Enter**, to select a command.
- Press **Esc**, to close the list.

---
*Note: Commands are interpreted locally by the Interceptor in the Dashboard.*