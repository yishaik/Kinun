/** Minimal MCP server over Streamable HTTP (JSON responses only): initialize, ping, tools/list, tools/call. */
import { READ_ONLY_TOOLS, TOOLS, ToolError, type ToolContext } from './tools';
import type { Plain } from './firestore';

const SUPPORTED_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];

export const SERVER_INFO = { name: 'kinun', version: '1.0.0' };

const INSTRUCTIONS =
  'Kinun is a Hebrew birth-preparation app shared by a couple. Call get_overview first, then list_items before adding ' +
  'anything to avoid duplicates. Write item titles in Hebrew. You can read, add, edit and tick off items; you cannot delete.';

interface RpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Plain;
}

type RpcResponse =
  | { jsonrpc: '2.0'; id: string | number | null; result: unknown }
  | { jsonrpc: '2.0'; id: string | number | null; error: { code: number; message: string } };

const ok = (id: RpcRequest['id'], result: unknown): RpcResponse => ({ jsonrpc: '2.0', id: id ?? null, result });
const fail = (id: RpcRequest['id'], code: number, message: string): RpcResponse => ({
  jsonrpc: '2.0',
  id: id ?? null,
  error: { code, message },
});

async function handleOne(msg: unknown, ctx: ToolContext): Promise<RpcResponse | null> {
  if (
    !msg ||
    typeof msg !== 'object' ||
    (msg as RpcRequest).jsonrpc !== '2.0' ||
    typeof (msg as RpcRequest).method !== 'string'
  ) {
    return fail(null, -32600, 'Invalid request');
  }
  const req = msg as RpcRequest;
  const isNotification = !('id' in req);
  const params = (req.params ?? {}) as Plain;

  switch (req.method) {
    case 'initialize': {
      const wanted = typeof params.protocolVersion === 'string' ? params.protocolVersion : '';
      return ok(req.id, {
        protocolVersion: SUPPORTED_VERSIONS.includes(wanted) ? wanted : SUPPORTED_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      });
    }
    case 'ping':
      return ok(req.id, {});
    case 'tools/list':
      return ok(req.id, {
        tools: TOOLS.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
          annotations: { readOnlyHint: READ_ONLY_TOOLS.has(t.name), destructiveHint: false, openWorldHint: false },
        })),
      });
    case 'tools/call': {
      const tool = TOOLS.find((t) => t.name === params.name);
      if (!tool) return fail(req.id, -32602, `Unknown tool: ${String(params.name)}`);
      const args = params.arguments && typeof params.arguments === 'object' ? (params.arguments as Plain) : {};
      try {
        const data = await tool.run(args, ctx);
        return ok(req.id, { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] });
      } catch (err) {
        // Validation problems are for the agent to read and fix; anything else is logged, not leaked.
        const message = err instanceof ToolError ? err.message : 'Internal error talking to the database';
        if (!(err instanceof ToolError)) console.error('tool failed', tool.name, err);
        return ok(req.id, { isError: true, content: [{ type: 'text', text: message }] });
      }
    }
    default:
      if (isNotification || req.method.startsWith('notifications/')) return null;
      return fail(req.id, -32601, `Method not found: ${req.method}`);
  }
}

/** Returns the JSON-RPC response body, or null when there is nothing to send back (notifications only). */
export async function handleRpc(body: unknown, ctx: ToolContext): Promise<RpcResponse | RpcResponse[] | null> {
  if (Array.isArray(body)) {
    if (body.length === 0) return fail(null, -32600, 'Invalid request');
    const out = (await Promise.all(body.map((m) => handleOne(m, ctx)))).filter((r): r is RpcResponse => r !== null);
    return out.length ? out : null;
  }
  return handleOne(body, ctx);
}
