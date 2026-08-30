const ANSI = /\u001b\[([0-9;]*)m/g;

const COLORS: Record<number, string> = {
  30: 'text-ink-faint',
  31: 'text-danger',
  32: 'text-ok',
  33: 'text-warn',
  34: 'text-info',
  35: 'text-signal',
  36: 'text-info',
  37: 'text-ink',
  90: 'text-ink-faint',
  91: 'text-danger',
  92: 'text-ok',
  93: 'text-warn',
  94: 'text-info',
  95: 'text-signal',
  96: 'text-info',
  97: 'text-ink',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function ansiToHtml(line: string): string {
  let result = '';
  let open = 0;
  let index = 0;
  let match: RegExpExecArray | null;

  ANSI.lastIndex = 0;
  while ((match = ANSI.exec(line)) !== null) {
    result += escapeHtml(line.slice(index, match.index));
    index = match.index + match[0].length;

    const codes = match[1].split(';').map((code) => Number(code || 0));
    const classes: string[] = [];

    for (const code of codes) {
      if (code === 0) {
        result += '</span>'.repeat(open);
        open = 0;
      } else if (code === 1) {
        classes.push('font-semibold');
      } else if (COLORS[code]) {
        classes.push(COLORS[code]);
      }
    }

    if (classes.length) {
      result += '<span class="' + classes.join(' ') + '">';
      open += 1;
    }
  }

  result += escapeHtml(line.slice(index));
  return result + '</span>'.repeat(open);
}
