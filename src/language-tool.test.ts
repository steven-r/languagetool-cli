import { applyEnableDisable, customMarkdownInterpreter } from './language-tool';

import { describe, expect, test } from 'vitest';

describe('custom markup', async () => {
    test('Test empty string', async () => {
        expect(customMarkdownInterpreter('')).toBe('');
      });

    test('newlines', async() => {
      expect(customMarkdownInterpreter('\n\nTest\n\n')).toBe('\n\n\n\n');
    });

    // enumerations
    test('numbers 1', async() => {
      expect(customMarkdownInterpreter('Some Text\n1. ')).toBe('\n** ');
    });

    test('numbers 2', async() => {
      expect(customMarkdownInterpreter('Some Text\n2. ')).toBe('\n** ');
    });

    test('numbers 10', async() => {
      expect(customMarkdownInterpreter('Some Text\n10. ')).toBe('\n** ');
    });

    test('numbers 2000', async() => {
      expect(customMarkdownInterpreter('2000. ')).toBe('** ');
    });

    test('numbers 10000', async() => {
      expect(customMarkdownInterpreter('Some Text\n10000. ')).toBe('\n');
    });

    // block comments
    test('blockcomment simple', async() => {
      expect(customMarkdownInterpreter(':: Test ::')).toBe('# ');
    });

    test('blockcomment simple2', async() => {
      expect(customMarkdownInterpreter(':::::: Test ::::')).toBe('# ');
    });

    test('regexopt 1', async() => {
      let s = '::: ' + 'A'.repeat(999) + ':::'
      expect(customMarkdownInterpreter(s)).toBe('# ');
    });

    test('regexopt 2', async() => {
      let s = '::: ' + 'A'.repeat(1000) + ":::"
      expect(customMarkdownInterpreter(s)).toBe('');
    });

  });

describe("comment parsing", async () => {
  test('applyEnableDisable - keep empty', async () => {
    const res = applyEnableDisable('', true, {})
    expect(res).toStrictEqual({})
  });

  test('applyEnableDisable - add true complex', async () => {
    const res = applyEnableDisable('A(Test)', true, {})
    expect(res).toStrictEqual({'A(Test)': true})
  });

  test('applyEnableDisable - add true simple', async () => {
    const res = applyEnableDisable('A', true, {})
    expect(res).toStrictEqual({'A': true})
  });

  test('applyEnableDisable - add false complex', async () => {
    const res = applyEnableDisable('A(Test)', false, {})
    expect(res).toStrictEqual({'A(Test)': false})
  });

  test('applyEnableDisable - add true complex', async () => {
    const res = applyEnableDisable('A(Test)', false, {})
    expect(res).toStrictEqual({'A(Test)': false})
  });

  //---

  test('applyEnableDisable - replace false true', async () => {
    const res = applyEnableDisable('A', false, {'A': true})
    expect(res).toStrictEqual({'A': false})
  });

  test('applyEnableDisable - replace true false', async () => {
    const res = applyEnableDisable('A', true, {'A': false})
    expect(res).toStrictEqual({'A': true})
  });

  test('applyEnableDisable - add second', async () => {
    const res = applyEnableDisable('B', true, {'A': true})
    expect(res).toStrictEqual({'B': true, 'A': true})
  });

  test('applyEnableDisable - add complex', async () => {
    const res = applyEnableDisable('A(bla)', true, {'A': true})
    expect(res).toStrictEqual({'A(bla)': true, 'A': true})
  });

  // CWE-1333
  test('CWE-1333', async () => {
    let s = '0(';
    s += '0(a'.repeat(10000);
    const res = applyEnableDisable(s, true, {})
    expect(res).toStrictEqual({})
  });

  test('applyEnableDisable - multiple add complex', async () => {
    const res = applyEnableDisable('A(bla) B C(DD)', true, {'A': true});
    expect(res).toStrictEqual({'A': true, 'A(bla)': true, 'B': true, 'C(DD)': true});
  });

  test('applyEnableDisable - multiple add/replace complex', async () => {
    const res = applyEnableDisable('A(bla) B C(DD) A', true, {'A': false});
    expect(res).toStrictEqual({'A': true, 'A(bla)': true, 'B': true, 'C(DD)': true});
  });


})