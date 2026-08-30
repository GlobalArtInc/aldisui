const ANSI = /\u001b\[([0-9;]*)m/g;

const COLORS: Record<number, string> = {
  30: 'text-zinc-500',
  31: 'text-rose-400',
  32: 'text-emerald-400',
  33: 'text-amber-300',
  34: 'text-sky-400',
  35: 'text-fuchsia-400',
  36: 'text-cyan-300',
  37: 'text-zinc-100',
  90: 'text-zinc-500',
  91: 'text-rose-300',
  92: 'text-emerald-300',
  93: 'text-amber-200',
  94: 'text-sky-300',
  95: 'text-fuchsia-300',
  96: 'text-cyan-200',
  97: 'text-white',
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

export function stripAnsi(line: string): string {
  return line.replace(ANSI, '');
}
