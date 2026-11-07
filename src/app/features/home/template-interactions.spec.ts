import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const componentPaths = [
  'src/app/features/auth/login.component.ts',
  'src/app/features/home/home.component.ts',
  'src/app/shared/components/navbar.component.ts',
  'src/app/shared/components/sidebar.component.ts',
];

describe('interactive templates', () => {
  it('wires every button to a click action or a form submit', () => {
    for (const componentPath of componentPaths) {
      const source = readFileSync(resolve(process.cwd(), componentPath), 'utf8');
      const buttons = source.match(/<button\b[\s\S]*?>/g) ?? [];

      expect(buttons.length, componentPath).toBeGreaterThan(0);
      for (const button of buttons) {
        expect(
          /type=["'](?:button|submit)["']/.test(button),
          `${componentPath} contains a button without an explicit type: ${button}`
        ).toBe(true);
        expect(
          /\(click\)=|type=["']submit["']/.test(button),
          `${componentPath} contains an unhandled button: ${button}`
        ).toBe(true);
      }
    }
  });

  it('does not permanently disable form controls or leave selects unbound', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/app/features/home/home.component.ts'), 'utf8');
    const controls = source.match(/<(?:input|select|textarea)\b[\s\S]*?>/g) ?? [];
    const inputs = controls.filter((control) => control.startsWith('<input') && !/type=["']file["']/.test(control));
    const selects = controls.filter((control) => control.startsWith('<select'));
    const textareas = controls.filter((control) => control.startsWith('<textarea'));

    expect(source).not.toMatch(/\[(?:disabled)\]="true"|disabled=["']true["']/);
    for (const input of inputs) {
      expect(input, `Unbound input: ${input}`).toContain('[(ngModel)]');
    }
    expect(selects.length).toBeGreaterThan(0);
    for (const select of selects) {
      expect(select, `Unbound select: ${select}`).toContain('[(ngModel)]');
    }
    for (const textarea of textareas) {
      expect(textarea, `Unbound textarea: ${textarea}`).toContain('[(ngModel)]');
    }
  });
});
