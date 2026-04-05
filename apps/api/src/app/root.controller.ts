import { Controller, Get, HttpCode } from '@nestjs/common';

/**
 * Routes outside the global `/api` prefix so the bare server URL is usable in a browser.
 */
@Controller()
export class RootController {
  @Get()
  root() {
    return {
      name: 'Nexo API',
      api: '/api',
      hint: 'Angular apps run on other ports (e.g. 4200 / 4300); this server is JSON only.',
    };
  }

  @Get('favicon.ico')
  @HttpCode(204)
  favicon() {
    // Browsers request this automatically; no asset to serve yet.
  }
}
