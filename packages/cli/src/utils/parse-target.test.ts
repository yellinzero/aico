import { describe, it, expect } from 'vitest';
import {
  parseTarget,
  parseSkillFullName,
  parseEmployeeFullName,
  isSkillFullName,
  isEmployeeFullName,
  buildSkillFullName,
  buildEmployeeFullName,
} from './parse-target.js';

describe('parseTarget', () => {
  describe('employee references', () => {
    it('should parse simple employee name', () => {
      const result = parseTarget('pm');
      expect(result.type).toBe('employee');
      expect(result.registry).toBe('@the-aico');
      expect(result.name).toBe('pm');
      expect(result.fullName).toBe('@the-aico/pm');
    });

    it('should parse full employee reference', () => {
      const result = parseTarget('@the-aico/backend');
      expect(result.type).toBe('employee');
      expect(result.registry).toBe('@the-aico');
      expect(result.name).toBe('backend');
      expect(result.fullName).toBe('@the-aico/backend');
    });

    it('should handle whitespace', () => {
      const result = parseTarget('  pm  ');
      expect(result.type).toBe('employee');
      expect(result.name).toBe('pm');
    });
  });

  describe('skill references', () => {
    it('should parse full skill reference', () => {
      const result = parseTarget('@the-aico/pm/brainstorming');
      expect(result.type).toBe('skill');
      expect(result.registry).toBe('@the-aico');
      expect(result.namespace).toBe('@the-aico/pm');
      expect(result.name).toBe('brainstorming');
      expect(result.fullName).toBe('@the-aico/pm/brainstorming');
    });

    it('should parse shared skill reference', () => {
      const result = parseTarget('@the-aico/_shared/code-review');
      expect(result.type).toBe('skill');
      expect(result.namespace).toBe('@the-aico/_shared');
      expect(result.name).toBe('code-review');
    });

    it('should parse backend init skill', () => {
      const result = parseTarget('@the-aico/backend/init');
      expect(result.type).toBe('skill');
      expect(result.namespace).toBe('@the-aico/backend');
      expect(result.name).toBe('init');
      expect(result.fullName).toBe('@the-aico/backend/init');
    });
  });

  describe('custom registry', () => {
    it('should use custom default registry', () => {
      const result = parseTarget('pm', '@custom-reg');
      expect(result.registry).toBe('@custom-reg');
      expect(result.fullName).toBe('@custom-reg/pm');
    });
  });
});

describe('parseSkillFullName', () => {
  it('should parse valid skill full name', () => {
    const result = parseSkillFullName('@the-aico/pm/brainstorming');
    expect(result).toEqual({
      registry: '@the-aico',
      employee: 'pm',
      skill: 'brainstorming',
    });
  });

  it('should parse shared skill full name', () => {
    const result = parseSkillFullName('@the-aico/_shared/code-review');
    expect(result).toEqual({
      registry: '@the-aico',
      employee: '_shared',
      skill: 'code-review',
    });
  });

  it('should return null for invalid format', () => {
    expect(parseSkillFullName('invalid')).toBeNull();
    expect(parseSkillFullName('@the-aico/pm')).toBeNull();
    expect(parseSkillFullName('pm/brainstorming')).toBeNull();
  });
});

describe('parseEmployeeFullName', () => {
  it('should parse valid employee full name', () => {
    const result = parseEmployeeFullName('@the-aico/pm');
    expect(result).toEqual({
      registry: '@the-aico',
      employee: 'pm',
    });
  });

  it('should return null for invalid format', () => {
    expect(parseEmployeeFullName('pm')).toBeNull();
    expect(parseEmployeeFullName('@the-aico/pm/brainstorming')).toBeNull();
  });
});

describe('isSkillFullName', () => {
  it('should return true for valid skill full names', () => {
    expect(isSkillFullName('@the-aico/pm/brainstorming')).toBe(true);
    expect(isSkillFullName('@the-aico/backend/init')).toBe(true);
    expect(isSkillFullName('@the-aico/_shared/code-review')).toBe(true);
  });

  it('should return false for invalid formats', () => {
    expect(isSkillFullName('pm')).toBe(false);
    expect(isSkillFullName('@the-aico/pm')).toBe(false);
    expect(isSkillFullName('backend/init')).toBe(false);
  });
});

describe('isEmployeeFullName', () => {
  it('should return true for valid employee full names', () => {
    expect(isEmployeeFullName('@the-aico/pm')).toBe(true);
    expect(isEmployeeFullName('@the-aico/backend')).toBe(true);
  });

  it('should return false for invalid formats', () => {
    expect(isEmployeeFullName('pm')).toBe(false);
    expect(isEmployeeFullName('@the-aico/pm/brainstorming')).toBe(false);
  });
});

describe('buildSkillFullName', () => {
  it('should build correct full name', () => {
    expect(buildSkillFullName('@the-aico', 'pm', 'brainstorming')).toBe(
      '@the-aico/pm/brainstorming'
    );
  });
});

describe('buildEmployeeFullName', () => {
  it('should build correct full name', () => {
    expect(buildEmployeeFullName('@the-aico', 'pm')).toBe('@the-aico/pm');
  });
});
