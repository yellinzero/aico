import { describe, it, expect } from 'vitest';
import {
  parseSkillFrontmatter,
  parseSkillFile,
  stripFrontmatter,
} from './skill.js';

describe('parseSkillFrontmatter', () => {
  it('should parse simple frontmatter', () => {
    const content = `---
name: test-skill
description: A test skill
---

# Test Skill
`;
    const result = parseSkillFrontmatter(content);
    expect(result).not.toBeNull();
    expect(result?.name).toBe('test-skill');
    expect(result?.description).toBe('A test skill');
  });

  it('should parse multiline description with pipe (literal block)', () => {
    const content = `---
name: test-skill
description: |
  Use when doing X.
  Use when doing Y.
  Use when user says "Z".
---
`;
    const result = parseSkillFrontmatter(content);
    expect(result).not.toBeNull();
    expect(result?.description).toContain('Use when doing X.');
    expect(result?.description).toContain('Use when doing Y.');
    expect(result?.description).toContain('Use when user says "Z".');
  });

  it('should parse multiline description with folded style (>)', () => {
    const content = `---
name: test-skill
description: >
  This is a long description
  that spans multiple lines
  but will be folded into one.
---
`;
    const result = parseSkillFrontmatter(content);
    expect(result).not.toBeNull();
    expect(result?.description).toContain('This is a long description');
  });

  it('should handle special characters in quotes', () => {
    const content = `---
name: test-skill
description: "Use when user says: 'hello' or asks \\"what?\\""
---
`;
    const result = parseSkillFrontmatter(content);
    expect(result).not.toBeNull();
    expect(result?.description).toContain("'hello'");
    expect(result?.description).toContain('"what?"');
  });

  it('should parse optional fields', () => {
    const content = `---
name: test-skill
description: A test skill
version: "1.0.0"
category: pm
tags:
  - planning
  - ideation
dependencies:
  - "@the-aico/pm/clarification"
---
`;
    const result = parseSkillFrontmatter(content);
    expect(result).not.toBeNull();
    expect(result?.version).toBe('1.0.0');
    expect(result?.category).toBe('pm');
    expect(result?.tags).toEqual(['planning', 'ideation']);
    expect(result?.dependencies).toEqual(['@the-aico/pm/clarification']);
  });

  it('should parse MCP dependencies', () => {
    const content = `---
name: test-skill
description: A test skill
mcpDependencies:
  - name: playwright
    package: "@playwright/mcp"
    description: Browser automation
    docsUrl: https://github.com/microsoft/playwright-mcp
---
`;
    const result = parseSkillFrontmatter(content);
    expect(result).not.toBeNull();
    expect(result?.mcpDependencies).toHaveLength(1);
    expect(result?.mcpDependencies?.[0]?.name).toBe('playwright');
    expect(result?.mcpDependencies?.[0]?.package).toBe('@playwright/mcp');
  });

  it('should return null for missing frontmatter', () => {
    const content = `# No frontmatter here`;
    const result = parseSkillFrontmatter(content);
    expect(result).toBeNull();
  });

  it('should return null for invalid YAML syntax', () => {
    const content = `---
name: test
description: bad: yaml: here: without: quotes
---
`;
    const result = parseSkillFrontmatter(content);
    expect(result).toBeNull();
  });

  it('should return null for missing required fields', () => {
    const content = `---
name: test-skill
---
`;
    const result = parseSkillFrontmatter(content);
    expect(result).toBeNull();
  });

  it('should handle Windows line endings (CRLF)', () => {
    const content = '---\r\nname: test-skill\r\ndescription: A test\r\n---\r\n';
    const result = parseSkillFrontmatter(content);
    expect(result).not.toBeNull();
    expect(result?.name).toBe('test-skill');
  });

  it('should handle BOM character', () => {
    const content = '\uFEFF---\nname: test-skill\ndescription: A test\n---\n';
    const result = parseSkillFrontmatter(content);
    expect(result).not.toBeNull();
    expect(result?.name).toBe('test-skill');
  });

  it('should parse real-world skill description', () => {
    const content = `---
name: aico-pm-brainstorming
description: |
  Guide users through structured dialogue to transform vague ideas into clear, actionable product concepts.

  Use this skill when:
  - User says "I have an idea" or "let's brainstorm"
  - Requirements are vague or incomplete
  - Need to explore problem space before solutions
---
`;
    const result = parseSkillFrontmatter(content);
    expect(result).not.toBeNull();
    expect(result?.name).toBe('aico-pm-brainstorming');
    expect(result?.description).toContain('Use this skill when:');
    expect(result?.description).toContain('I have an idea');
  });
});

describe('parseSkillFile', () => {
  it('should extract body content', () => {
    const content = `---
name: test-skill
description: A test skill
---

# Test Skill

This is the body content.

## Section

More content here.
`;
    const result = parseSkillFile(content);
    expect(result).not.toBeNull();
    expect(result?.frontmatter.name).toBe('test-skill');
    expect(result?.body).toContain('# Test Skill');
    expect(result?.body).toContain('This is the body content.');
    expect(result?.body).toContain('## Section');
  });

  it('should handle empty body', () => {
    const content = `---
name: test-skill
description: A test skill
---
`;
    const result = parseSkillFile(content);
    expect(result).not.toBeNull();
    expect(result?.body).toBe('');
  });

  it('should handle body with only whitespace', () => {
    const content = `---
name: test-skill
description: A test skill
---


`;
    const result = parseSkillFile(content);
    expect(result).not.toBeNull();
    expect(result?.body).toBe('');
  });

  it('should return null for invalid frontmatter', () => {
    const content = `# No frontmatter`;
    const result = parseSkillFile(content);
    expect(result).toBeNull();
  });
});

describe('stripFrontmatter', () => {
  it('should remove frontmatter from content', () => {
    const content = `---
name: test
description: test
---

# Body Content
`;
    const result = stripFrontmatter(content);
    expect(result.trim()).toBe('# Body Content');
  });

  it('should handle content without frontmatter', () => {
    const content = `# Just Body`;
    const result = stripFrontmatter(content);
    expect(result).toBe('# Just Body');
  });

  it('should handle CRLF line endings', () => {
    const content =
      '---\r\nname: test\r\ndescription: test\r\n---\r\n\r\n# Body';
    const result = stripFrontmatter(content);
    expect(result.trim()).toBe('# Body');
  });
});
