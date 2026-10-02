import { QTreeNode } from './types';
import { meta_state_enum } from './enums';

// Text labels standing in for the IBIS icons, which do not survive a paste.
const nodeTypeLabels: Record<string, string> = {
  question: '?',
  answer: '!',
  con_answer: '‽',
  pro: '+',
  con: '-',
  reference: '#',
};
// Meta nodes show the note icon in the tree view, whatever their type.
const metaLabel = '%';

function label(node: QTreeNode): string {
  const prefix =
    node.meta === meta_state_enum.meta
      ? metaLabel
      : nodeTypeLabels[node.node_type];
  return prefix ? `${prefix} ${node.title}` : node.title;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').trim();
}

// Maps a creator_id to a display name; empty string when unknown.
export type AuthorLookup = (creatorId: number) => string;

function nodesToHtml(nodes: QTreeNode[], authorOf: AuthorLookup): string {
  if (!nodes.length) return '';
  const items = nodes.map((node) => {
    const author = authorOf(node.creator_id);
    return (
      `<li><strong>${escapeHtml(label(node))}</strong>` +
      (author ? ` <em>(${escapeHtml(author)})</em>` : '') +
      (node.url
        ? `<br><a href="${escapeHtml(node.url)}">${escapeHtml(node.url)}</a>`
        : '') +
      (node.description ? `<br>${node.description}` : '') +
      nodesToHtml(node.children ?? [], authorOf) +
      '</li>'
    );
  });
  return `<ul>${items.join('')}</ul>`;
}

function nodesToText(
  nodes: QTreeNode[],
  authorOf: AuthorLookup,
  depth = 0,
): string[] {
  const indent = '  '.repeat(depth);
  return nodes.flatMap((node) => {
    const author = authorOf(node.creator_id);
    const lines = [`${indent}- ${label(node)}${author ? ` (${author})` : ''}`];
    if (node.url) lines.push(`${indent}  ${node.url}`);
    const description = node.description ? htmlToText(node.description) : '';
    if (description) {
      lines.push(
        ...description
          .split('\n')
          .filter((line) => line.trim())
          .map((line) => `${indent}  ${line.trim()}`),
      );
    }
    return lines.concat(nodesToText(node.children ?? [], authorOf, depth + 1));
  });
}

export function treeToHtml(tree: QTreeNode[], authorOf: AuthorLookup): string {
  return nodesToHtml(tree, authorOf);
}

export function treeToText(tree: QTreeNode[], authorOf: AuthorLookup): string {
  return nodesToText(tree, authorOf).join('\n');
}

// Puts both an HTML and a plain-text version on the clipboard, so that
// Google Docs and Word get a nested list, and plain editors get indented text.
export async function copyTreeToClipboard(
  tree: QTreeNode[],
  authorOf: AuthorLookup,
): Promise<void> {
  const html = treeToHtml(tree, authorOf);
  const text = treeToText(tree, authorOf);
  await navigator.clipboard.write([
    new ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([text], { type: 'text/plain' }),
    }),
  ]);
}
