import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import * as steemconnect from 'steemconnect';

export function getBaseUrl() {
  return document.getElementsByTagName('base')[0].href;
}

export function initializeSteem() {
    console.log("Initialize Steem Api")
  var api =  steemconnect.Initialize({
          app: 'gitsteem-co',
          callbackURL: 'http://localhost:5000/profile',
          scope: ['vote', 'comment', 'custom_json', 'comment_options'],
          });

    console.log("Steem Api Initialized")

    var token = localStorage.getItem('steemToken');

    if (token) {
        api.setAccessToken(token);
    }

    return api;
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
   