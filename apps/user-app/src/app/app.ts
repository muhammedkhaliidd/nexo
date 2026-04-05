import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { NexoPanel } from '@nexo/shared-ui';
import { canAccessAdminApp } from '@nexo/shared-auth';

@Component({
  imports: [RouterModule, ButtonModule, NexoPanel],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = 'user-app';
  protected readonly vendorCanOpenAdmin = canAccessAdminApp('vendor');
}
