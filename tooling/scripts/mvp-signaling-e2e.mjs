/**
 * MVP 信令 E2E：模拟 Agent + Controller join，验证 peer-joined / offer 可达。
 * 用法: node tooling/scripts/mvp-signaling-e2e.mjs
 */
import { randomBytes } from 'node:crypto';
/* Node 22+ 内置 WebSocket */

const API = process.env.VISTAREMOTE_API_URL ?? 'http://127.0.0.1:3000';
const WS_URL = process.env.VISTAREMOTE_SIGNALING_URL ?? 'ws://127.0.0.1:3000/signaling';

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function connectWs() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    const inbox = [];
    ws.addEventListener('open', () => resolve({ ws, inbox }));
    ws.addEventListener('error', () => reject(new Error('WebSocket failed')));
    ws.addEventListener('message', (ev) => {
      try {
        inbox.push(JSON.parse(String(ev.data)));
      } catch {
        /* ignore */
      }
    });
  });
}

function send(ws, env) {
  ws.send(JSON.stringify(env));
}

async function main() {
  const health = await fetch(`${API}/health`).catch(() => null);
  if (!health?.ok) {
    console.error('FAIL: API not ready at', API);
    process.exit(1);
  }

  const createRes = await fetch(`${API}/api/v1/devices/pairing-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceId: `agent_${randomBytes(4).toString('hex')}`,
      deviceLabel: 'e2e',
      ttlSec: 600,
      allowMultiController: false,
    }),
  });
  if (!createRes.ok) {
    console.error('FAIL: create pairing', createRes.status);
    process.exit(1);
  }
  const pairing = await createRes.json();
  const sessionId = pairing.sessionId;
  const code = pairing.numericCode;
  console.log('pairing', { sessionId, code });

  const agentId = `agent_${randomBytes(4).toString('hex')}`;
  const ctrlId = `ctrl_${randomBytes(4).toString('hex')}`;

  const agent = await connectWs();
  send(agent.ws, {
    v: 1,
    type: 'join',
    sessionId,
    deviceId: agentId,
    ts: Date.now(),
    payload: { role: 'agent' },
  });
  await wait(200);

  const joinRes = await fetch(`${API}/api/v1/auth/pairing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method: 'code', code }),
  });
  if (!joinRes.ok) {
    console.error('FAIL: join pairing HTTP', joinRes.status, await joinRes.text());
    process.exit(1);
  }
  const joinBody = await joinRes.json();
  console.log('http join', joinBody);

  const ctrl = await connectWs();
  send(ctrl.ws, {
    v: 1,
    type: 'join',
    sessionId,
    deviceId: ctrlId,
    ts: Date.now(),
    payload: { role: 'controller', userId: 'mvp-controller' },
  });

  await wait(500);

  const agentPeerJoined = agent.inbox.filter((m) => m.type === 'peer-joined');
  const ctrlJoined = ctrl.inbox.filter((m) => m.type === 'joined');
  const ctrlErrors = ctrl.inbox.filter((m) => m.type === 'error');

  console.log('agent inbox types', agent.inbox.map((m) => m.type));
  console.log('ctrl inbox types', ctrl.inbox.map((m) => m.type));

  if (ctrlErrors.length) {
    console.error('FAIL: controller got error', ctrlErrors);
    process.exit(1);
  }
  if (!agentPeerJoined.length) {
    console.error('FAIL: agent did not receive peer-joined');
    process.exit(1);
  }
  const joinedPayload = ctrlJoined[0]?.payload;
  if (joinedPayload?.otherPeers && !joinedPayload.otherPeers.includes(agentId)) {
    console.warn('WARN: otherPeers', joinedPayload.otherPeers, 'expected', agentId);
  }

  // offer path
  send(agent.ws, {
    v: 1,
    type: 'offer',
    sessionId,
    deviceId: agentId,
    ts: Date.now(),
    payload: { type: 'offer', sdp: 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\n' },
  });
  await wait(300);
  const ctrlOffer = ctrl.inbox.filter((m) => m.type === 'offer');
  if (!ctrlOffer.length) {
    console.error('FAIL: controller did not receive offer');
    process.exit(1);
  }

  console.log('OK: signaling e2e passed');
  agent.ws.close();
  ctrl.ws.close();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
