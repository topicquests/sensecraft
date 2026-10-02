import { describe, expect, it } from 'vitest';
import { treeToHtml, treeToText } from '../../../src/tree-export';
import { QTreeNode } from '../../../src/types';

const node = (
  node_type: string,
  title: string,
  children: QTreeNode[] = [],
  extra: Partial<QTreeNode> = {},
) =>
  ({
    node_type,
    title,
    children,
    description: '',
    creator_id: 2,
    ...extra,
  }) as unknown as QTreeNode;

const authors: Record<number, string> = { 1: 'alice of Guild A' };
const authorOf = (id: number) => authors[id] ?? '';

const tree = [
  node(
    'question',
    'Root <q>',
    [
      node('answer', 'Idea', [
        node('pro', 'Good'),
        node('con', 'Bad', [node('con_answer', 'Rebuttal')]),
      ]),
      node('reference', 'Note', [], { url: 'https://example.com/?a=1&b=2' }),
    ],
    { description: '<p>Why?</p>', creator_id: 1 },
  ),
];

describe('tree export', () => {
  it('produces indented text with labels, authors and urls', () => {
    expect(treeToText(tree, authorOf)).toBe(
      [
        '- ? Root <q> (alice of Guild A)',
        '  Why?',
        '  - ! Idea',
        '    - + Good',
        '    - - Bad',
        '      - ‽ Rebuttal',
        '  - # Note',
        '    https://example.com/?a=1&b=2',
      ].join('\n'),
    );
  });

  it('labels meta nodes as notes', () => {
    const meta = [node('answer', 'Aside', [], { meta: 'meta' } as any)];
    expect(treeToText(meta, authorOf)).toBe('- % Aside');
  });

  it('produces nested html lists, escaping titles and urls', () => {
    expect(treeToHtml(tree, authorOf)).toBe(
      '<ul><li><strong>? Root &lt;q&gt;</strong> <em>(alice of Guild A)</em>' +
        '<br><p>Why?</p>' +
        '<ul><li><strong>! Idea</strong>' +
        '<ul><li><strong>+ Good</strong></li>' +
        '<li><strong>- Bad</strong><ul><li><strong>‽ Rebuttal</strong></li></ul></li></ul></li>' +
        '<li><strong># Note</strong>' +
        '<br><a href="https://example.com/?a=1&amp;b=2">https://example.com/?a=1&amp;b=2</a>' +
        '</li></ul></li></ul>',
    );
  });
});
