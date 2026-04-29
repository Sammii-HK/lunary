'use client';

import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useMemo,
  type ReactElement,
  type ReactNode,
} from 'react';
import { findAllTerms, type TermMatch } from '@/lib/glossary/terms';
import { GlossaryTooltip } from './GlossaryTooltip';

export type AutoLinkDensity = 'all' | 'first' | 'none';

type Props = {
  children: ReactNode;
  /**
   * Controls how aggressively terms are linked.
   * - 'first' (default) — only the first occurrence per render is linked.
   * - 'all' — every occurrence becomes a tooltip.
   * - 'none' — text passes through untouched.
   */
  density?: AutoLinkDensity;
  /**
   * Convenience boolean: if true, sets density to 'first'. Defaults to true,
   * matching the documented mounting strategy.
   */
  linkOnce?: boolean;
  /** Optional wrapper element. Defaults to a span (inline). */
  as?: 'span' | 'div' | 'p';
  className?: string;
};

/**
 * Splits a plain string into ReactNodes, wrapping every glossary match in
 * a GlossaryTooltip. Original casing is preserved.
 */
function linkifyString(
  input: string,
  density: AutoLinkDensity,
  keyPrefix: string,
): ReactNode[] {
  if (!input || density === 'none') return [input];
  const allMatches = findAllTerms(input);
  if (allMatches.length === 0) return [input];

  // Apply linkOnce semantics by filtering to first hit per term id.
  const matches: TermMatch[] = [];
  if (density === 'first') {
    const seen = new Set<string>();
    for (const m of allMatches) {
      if (seen.has(m.term.id)) continue;
      seen.add(m.term.id);
      matches.push(m);
    }
  } else {
    matches.push(...allMatches);
  }

  // findAllTerms already returns sorted, non-overlapping matches.
  const out: ReactNode[] = [];
  let cursor = 0;
  matches.forEach((m, i) => {
    if (m.start > cursor) {
      out.push(input.slice(cursor, m.start));
    }
    out.push(
      <GlossaryTooltip key={`${keyPrefix}-${i}-${m.start}`} term={m.term}>
        {m.matchedText}
      </GlossaryTooltip>,
    );
    cursor = m.end;
  });
  if (cursor < input.length) {
    out.push(input.slice(cursor));
  }
  return out;
}

/**
 * Recursively walks children, only linkifying string leaves. Preserves
 * any custom React elements (e.g. <strong>, <em>, links) untouched.
 */
function processNode(
  node: ReactNode,
  density: AutoLinkDensity,
  keyPrefix: string,
): ReactNode {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return node;
  }
  if (typeof node === 'string') {
    const parts = linkifyString(node, density, keyPrefix);
    if (parts.length === 1) return parts[0];
    return (
      <>
        {parts.map((p, i) =>
          typeof p === 'string' ? (
            <Fragment key={`${keyPrefix}-s${i}`}>{p}</Fragment>
          ) : (
            <Fragment key={`${keyPrefix}-w${i}`}>{p}</Fragment>
          ),
        )}
      </>
    );
  }
  if (typeof node === 'number') return node;

  if (Array.isArray(node)) {
    return node.map((child, i) =>
      processNode(child, density, `${keyPrefix}-${i}`),
    );
  }

  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    // Don't recurse into a tooltip we already rendered (defensive).
    if (typeof el.type === 'function') {
      const componentType = el.type as {
        displayName?: string;
        name?: string;
      };
      if (
        componentType.displayName === 'GlossaryTooltip' ||
        componentType.name === 'GlossaryTooltip'
      ) {
        return el;
      }
    }
    const childChildren = el.props?.children;
    if (childChildren === undefined || childChildren === null) return el;
    const newChildren = Children.map(childChildren, (c, i) =>
      processNode(c, density, `${keyPrefix}-c${i}`),
    );
    return cloneElement(el, undefined, newChildren);
  }

  return node;
}

export function AutoLinkText({
  children,
  density,
  linkOnce = true,
  as: Tag = 'span',
  className,
}: Props) {
  const effectiveDensity: AutoLinkDensity =
    density ?? (linkOnce ? 'first' : 'all');

  const processed = useMemo(
    () => processNode(children, effectiveDensity, 'al'),
    [children, effectiveDensity],
  );

  if (effectiveDensity === 'none') {
    return <Tag className={className}>{children}</Tag>;
  }

  return <Tag className={className}>{processed}</Tag>;
}

export default AutoLinkText;
