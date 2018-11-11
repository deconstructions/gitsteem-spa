import { Injectable, Inject } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import * as steemconnect from 'steemconnect';
 
@Injectable()
export class AuthGuard implements CanActivate {

    private api;

    constructor(private router: Router, @Inject('STEEM_API') api: steemconnect)
    {
        this.api = api;
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
            window.location.href = "https://github.com/login/oauth/authorize?client_id=197e2e9b1b3104d1b7e5&redirect_uri=http://localhost:5000/profile/&scope=public_repo%20read:user";
            return false;
        }

        console.log("Redirecting to Steemconnect")
        // not logged in so redirect to steemconnect page
        window.location.href = this.api.getLoginURL();
        return false;
    }
}