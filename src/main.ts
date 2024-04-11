import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

import './assets/js/utils/common/svg-pan-zoom'

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
