/**
 * aico search - Search for skills and employees in the registry.
 */

import { Command } from 'commander';
import kleur from 'kleur';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { handleError, notInitializedError } from '../utils/errors.js';
import { fetchRegistryIndex } from '../registry/client.js';

interface SearchableItem {
  name: string;
  fullName: string;
  description: string;
  category?: string;
  tags?: string[];
  type: 'skill' | 'employee';
}

/**
 * Search items by query.
 */
function searchItems(query: string, items: SearchableItem[]): SearchableItem[] {
  const q = query.toLowerCase();

  return items.filter((item) => {
    // Search name
    if (item.name.toLowerCase().includes(q)) return true;

    // Search full name
    if (item.fullName.toLowerCase().includes(q)) return true;

    // Search description
    if (item.description.toLowerCase().includes(q)) return true;

    // Search tags
    if (item.tags?.some((tag) => tag.toLowerCase().includes(q))) return true;

    // Search category
    if (item.category?.toLowerCase().includes(q)) return true;

    return false;
  });
}

/**
 * Calculate relevance score for an item.
 */
function scoreItem(item: SearchableItem, query: string): number {
  const q = query.toLowerCase();
  let score = 0;

  // Exact name match
  if (item.name.toLowerCase() === q) {
    score += 100;
  }
  // Name contains query
  else if (item.name.toLowerCase().includes(q)) {
    score += 50;
  }

  // Tag exact match
  if (item.tags?.some((tag) => tag.toLowerCase() === q)) {
    score += 30;
  }

  // Category match
  if (item.category?.toLowerCase() === q) {
    score += 20;
  }

  // Description contains query
  if (item.description.toLowerCase().includes(q)) {
    score += 10;
  }

  return score;
}

/**
 * Sort items by relevance score.
 */
function sortByRelevance(
  items: SearchableItem[],
  query: string
): SearchableItem[] {
  return items
    .map((item) => ({ ...item, score: scoreItem(item, query) }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Filter by category.
 */
function filterByCategory(
  items: SearchableItem[],
  category: string
): SearchableItem[] {
  return items.filter((item) => item.category === category);
}

/**
 * Filter by type.
 */
function filterByType(
  items: SearchableItem[],
  type: 'skill' | 'employee'
): SearchableItem[] {
  return items.filter((item) => item.type === type);
}

/**
 * Format results as table.
 */
function formatTable(items: SearchableItem[]): string {
  if (items.length === 0) {
    return kleur.yellow('No results found.');
  }

  // Calculate column widths
  const nameWidth = Math.max(
    'Name'.length,
    ...items.map((i) => i.fullName.length)
  );
  const typeWidth = Math.max('Type'.length, ...items.map((i) => i.type.length));
  const catWidth = Math.max(
    'Category'.length,
    ...items.map((i) => (i.category || '-').length)
  );
  const descWidth = 40;

  // Header
  const header = [
    'Name'.padEnd(nameWidth),
    'Type'.padEnd(typeWidth),
    'Category'.padEnd(catWidth),
    'Description',
  ].join(' │ ');

  const separator = [
    '─'.repeat(nameWidth),
    '─'.repeat(typeWidth),
    '─'.repeat(catWidth),
    '─'.repeat(descWidth),
  ].join('─┼─');

  // Rows
  const rows = items.map((item) => {
    const desc =
      item.description.length > descWidth
        ? item.description.slice(0, descWidth - 3) + '...'
        : item.description;

    return [
      item.fullName.padEnd(nameWidth),
      item.type.padEnd(typeWidth),
      (item.category || '-').padEnd(catWidth),
      desc,
    ].join(' │ ');
  });

  return [kleur.bold(header), separator, ...rows].join('\n');
}

/**
 * Format results as JSON.
 */
function formatJSON(items: SearchableItem[]): string {
  const output = {
    count: items.length,
    results: items.map((item) => ({
      name: item.name,
      fullName: item.fullName,
      type: item.type,
      category: item.category,
      description: item.description,
      tags: item.tags,
      install:
        item.type === 'employee'
          ? `aico add ${item.name}`
          : `aico add ${item.fullName}`,
    })),
  };

  return JSON.stringify(output, null, 2);
}

export const search = new Command()
  .name('search')
  .description('Search for skills and employees')
  .argument('<query>', 'Search query')
  .option(
    '-c, --category <category>',
    'Filter by category (pm, frontend, backend)'
  )
  .option('-t, --type <type>', 'Filter by type (skill, employee)')
  .option('--json', 'Output as JSON')
  .option('--limit <n>', 'Limit results', '10')
  .option('--cwd <cwd>', 'Working directory', process.cwd())
  .action(async (query: string, opts) => {
    try {
      const config = await getConfig(opts.cwd);
      if (!config) {
        throw notInitializedError();
      }

      logger.info('Searching...');

      // Fetch registry index
      const index = await fetchRegistryIndex(config, opts.cwd);

      // Build searchable items
      const items: SearchableItem[] = [
        ...index.employees.map((emp) => ({
          name: emp.name,
          fullName: emp.fullName || emp.name,
          description: emp.description || '',
          category: emp.category,
          type: 'employee' as const,
        })),
      ];

      // Search
      let results = searchItems(query, items);

      // Filter by category
      if (opts.category) {
        results = filterByCategory(results, opts.category);
      }

      // Filter by type
      if (opts.type) {
        results = filterByType(results, opts.type as 'skill' | 'employee');
      }

      // Sort by relevance
      results = sortByRelevance(results, query);

      // Limit
      const limit = parseInt(opts.limit, 10);
      results = results.slice(0, limit);

      // Output
      logger.break();
      if (opts.json) {
        logger.log(formatJSON(results));
      } else {
        logger.log(
          kleur.cyan(`Found ${results.length} result(s) for "${query}":`)
        );
        logger.break();
        logger.log(formatTable(results));
        logger.break();

        if (results.length > 0) {
          logger.dim('Install: aico add <name>');
        }
      }
    } catch (error) {
      handleError(error);
    }
  });
