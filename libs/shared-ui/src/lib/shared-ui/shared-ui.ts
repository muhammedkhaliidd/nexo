import { Component, input } from '@angular/core';

@Component({
  selector: 'nexo-panel',
  imports: [],
  templateUrl: './shared-ui.html',
  styleUrl: './shared-ui.css',
})
export class NexoPanel {
  readonly title = input.required<string>();
}
