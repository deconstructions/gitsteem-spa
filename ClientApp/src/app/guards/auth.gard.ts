import { Injectable, Inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import * as steemconnect from 'steemconnect';
 
@Injectable()
export class AuthGuard implements CanActivate {

    private api;
    private baseUrl;

    constructor(@Inject('BASE_URL') baseUrl: string, @Inject('STEEM_API') api: steemconnect)
    {
        this.api = api;
        this.baseUrl = baseUrl;
    }
 
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    {
        console.log("Enter Authentication Guard")

        if (localStorage.getItem('currentUser'))
        {
            console.log("Steem user already set")

            if (localStorage.getItem('githubUser'))
            {
              console.log("Github user already set")
              // logged in so return true
              return true;
            }

            console.log("Redirecting to Github")
            // not logged in so redirect to github auth page
            window.location.href = this.baseUrl + 'api/Github/StartAuthFlow';

            return false;
        }

        console.log("Redirecting to Steemconnect")
        // not logged in so redirect to steemconnect page
        window.location.href = this.api.getLoginURL();
        return false;
    }
}