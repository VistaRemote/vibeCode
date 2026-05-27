import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const MANIFEST_REL = join('.meta', 'manifest.json');
const CONFIG_REL = join('.meta', 'config.json');

/**
 * @param {string} metaRoot
 */
export function loadMetaManifest(metaRoot) {
  const manifestPath = join(metaRoot, MANIFEST_REL);
  if (!existsSync(manifestPath)) {
    throw new Error(`Missing ${MANIFEST_REL} — run from VistaRemote Meta-Repo root.`);
  }
  const raw = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const configPath = join(metaRoot, CONFIG_REL);
  const config = existsSync(configPath)
    ? JSON.parse(readFileSync(configPath, 'utf8'))
    : {};

  const projects = raw.projects ?? {};
  const installOrder = raw.installOrder ?? Object.keys(projects);
  const devUpInstallOrder = raw.devUpInstallOrder ?? installOrder;

  return {
    version: raw.version ?? 1,
    config,
    projects,
    installOrder,
    devUpInstallOrder,
    excludedFromInit: raw.excludedFromInit ?? {},
  };
}

/**
 * @param {ReturnType<typeof loadMetaManifest>} manifest
 * @param {{ https?: boolean }} [opts]
 */
export function projectRemote(manifest, projectKey, opts = {}) {
  const p = manifest.projects[projectKey];
  if (!p) return null;
  const useHttps =
    opts.https ?? manifest.config.cloneProtocol === 'https';
  return useHttps ? (p.remoteHttps ?? p.remote) : p.remote;
}

export function listProjectKeys(manifest) {
  return Object.keys(manifest.projects);
}
