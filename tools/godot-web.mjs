import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { resolve, extname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const project = join(root, 'godot');
const output = join(project, 'build', 'web');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.wasm': 'application/wasm',
  '.pck': 'application/octet-stream',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

if (process.argv[2] === 'export') {
  await mkdir(output, { recursive: true });
  const godot = process.env.GODOT_BIN || 'godot';
  const result = spawnSync(
    godot,
    [
      '--headless',
      '--path',
      project,
      '--export-release',
      'Web',
      join(output, 'index.html'),
    ],
    {
      stdio: 'inherit',
    },
  );
  if (result.error) {
    console.error(
      `Godot không chạy được: ${result.error.message}. Đặt GODOT_BIN tới Godot bản thường.`,
    );
  }
  process.exit(result.status ?? 1);
} else if (process.argv[2] === 'preview') {
  try {
    await stat(join(output, 'index.html'));
  } catch {
    console.error('Chưa có bản xuất web. Chạy pnpm godot:export trước.');
    process.exit(1);
  }

  createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, 'http://localhost').pathname,
      );
      const target = resolve(
        output,
        `.${pathname === '/' ? '/index.html' : pathname}`,
      );
      if (target !== output && !target.startsWith(output + sep)) {
        response.writeHead(403).end();
        return;
      }
      const bytes = await readFile(target);
      response
        .writeHead(200, {
          'Content-Type': mime[extname(target)] || 'application/octet-stream',
          'Cache-Control': 'no-store',
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Embedder-Policy': 'require-corp',
        })
        .end(bytes);
    } catch (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 400).end();
    }
  }).listen(15173, '127.0.0.1', () => {
    console.log('Godot preview: http://localhost:15173');
  });
} else {
  console.error('Dùng: pnpm godot:export hoặc pnpm godot:preview');
  process.exit(1);
}
