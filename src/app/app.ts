import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Poll } from './poll/poll';

@Component({
  imports: [Poll],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('voting-app-frontside');
}
