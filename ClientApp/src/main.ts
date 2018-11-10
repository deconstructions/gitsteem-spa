import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import * as steemconnect from 'steemconnect';

export function getBaseUrl() {
  return document.getElementsByTagName('base')[0].href;
}

export function initializeSteem() {
  return steemconnect.Initialize({
          app: 'gitsteem-co',
          callbackURL: 'http://localhost:5000/',
          scope: ['vote', 'comment']
        });
}

const providers = [
     { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] },
     { provide: 'STEEM_API', useFactory: initializeSteem, deps: [] }
];

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic(providers).bootstrapModule(AppModule)
  .catch(err => console.log(err));
   