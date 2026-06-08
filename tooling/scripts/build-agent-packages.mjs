#!/usr/bin/env node
/**
 * 构建三种 Desktop Agent 安装包变体（需 desktop 仓配置 electron-builder channel）。
 * 用法：node tooling/scripts/build-agent-packages.mjs [consumer|enterprise_byod|enterprise_managed|all]
 */
const channels = {
  consumer: {
    VISTAREMOTE_INSTALL_CHANNEL: 'consumer',
    VISTAREMOTE_DEPLOYMENT_MODE: 'interactive',
    artifact: 'VistaRemote-Agent-Consumer',
  },
  enterprise_byod: {
    VISTAREMOTE_INSTALL_CHANNEL: 'enterprise_byod',
    VISTAREMOTE_DEPLOYMENT_MODE: 'enrolled_auto',
    artifact: 'VistaRemote-Agent-EntBYOD',
  },
  enterprise_managed: {
    VISTAREMOTE_INSTALL_CHANNEL: 'enterprise_managed',
    VISTAREMOTE_DEPLOYMENT_MODE: 'managed_silent',
    artifact: 'VistaRemote-Agent-EntManaged',
  },
};

const target = process.argv[2] ?? 'all';
const list =
  target === 'all'
    ? Object.keys(channels)
    : [target].filter((k) => channels[k]);

if (list.length === 0) {
  console.error('Unknown channel:', target);
  process.exit(1);
}

for (const key of list) {
  const cfg = channels[key];
  console.log(`\n==> Build ${key} (${cfg.artifact})`);
  console.log('   Set env:', cfg);
  console.log('   In desktop/: pnpm build && electron-builder with above env (P1)');
}

console.log('\nSee spec/agent-distribution-spec.md for artifact naming.');
