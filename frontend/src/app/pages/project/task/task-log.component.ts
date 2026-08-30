import { DatePipe } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { UiButtonDirective, UiIconComponent, UiInputDirective } from '@globalart/platform-ui';

export interface TaskLogLine {
  id: number;
  time: string;
  text: string;
  html: string;
}

export type TaskLogSeverity = 'error' | 'warn' | 'plain';

interface RenderedLine extends TaskLogLine {
  severity: TaskLogSeverity;
}

const ERROR = /(fatal:|ERROR!?|failed|error:|unreachable)/i;
const WARNING = /(warning|\[WARNING\]|skipping|retrying)/i;

@Component({
  selector: 'aldis-task-log',
  standalone: true,
  imports: [DatePipe, FormsModule, TranslatePipe, UiButtonDirective, UiIconComponent, UiInputDirective],
  templateUrl: './task-log.component.html',
  host: { class: 'flex min-h-0 flex-col gap-2' },
})
export class TaskLogComponent implements AfterViewChecked {
  @Input() set lines(value: TaskLogLine[]) {
    this.source.set(value);
  }

  @Input() active = false;
  @Input() rawUrl = '';
  @Input() tall = false;
  @Input() fill = false;

  @ViewChild('scroller') private scroller?: ElementRef<HTMLElement>;

  readonly source = signal<TaskLogLine[]>([]);
  readonly query = signal('');
  readonly showTime = signal(true);
  readonly follow = signal(true);
  readonly copied = signal(false);

  readonly rendered = computed<RenderedLine[]>(() => {
    const search = this.query().trim().toLowerCase();

    return this.source()
      .filter((line) => !search || line.text.toLowerCase().includes(search))
      .map((line) => ({ ...line, severity: this.severity(line.text) }));
  });

  readonly total = computed(() => this.source().length);
  readonly shown = computed(() => this.rendered().length);

  readonly bodyClass = computed(() => {
    const base =
      'relative overflow-auto rounded-panel border border-line bg-[#0f1115] py-2 font-mono text-[13px] leading-[1.55] text-zinc-200 ';

    if (this.fill) {
      return base + 'min-h-0 flex-1';
    }

    return base + (this.tall ? 'flex-1 max-h-[68vh] min-h-[38vh]' : 'flex-1 max-h-[46vh] min-h-[24vh]');
  });

  private lastCount = 0;

  ngAfterViewChecked(): void {
    const count = this.rendered().length;
    if (count === this.lastCount) {
      return;
    }

    this.lastCount = count;

    if (this.follow()) {
      this.toBottom();
    }
  }

  rowClass(line: RenderedLine): string {
    const base = 'group flex gap-3 px-3 hover:bg-white/[0.04]';

    if (line.severity === 'error') {
      return `${base} bg-rose-500/10 text-rose-200`;
    }
    if (line.severity === 'warn') {
      return `${base} text-amber-200`;
    }
    return base;
  }

  onScroll(): void {
    const element = this.scroller?.nativeElement;
    if (!element) {
      return;
    }

    const atBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 24;
    this.follow.set(atBottom);
  }

  toBottom(): void {
    const element = this.scroller?.nativeElement;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
    this.follow.set(true);
  }

  async copy(): Promise<void> {
    const text = this.rendered()
      .map((line) => line.text)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      this.copied.set(false);
    }
  }

  private severity(text: string): TaskLogSeverity {
    if (ERROR.test(text)) {
      return 'error';
    }
    if (WARNING.test(text)) {
      return 'warn';
    }
    return 'plain';
  }
}
