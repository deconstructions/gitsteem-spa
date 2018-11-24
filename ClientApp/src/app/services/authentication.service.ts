import { Injectable, Inject} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import * as steemconnect from 'steemconnect';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import 'rxjs/add/operator/map';
 
@Injectable()
export class AuthenticationService {

    private api;

    private baseUrl: string;

    constructor(
        private http: HttpClient,
        private router: Router,
        @Inject('STEEM_API') api: steemconnect,
        @Inject('BASE_URL') baseUrl: string)
    {
        this.api = api;
        this.baseUrl = baseUrl;
    }

    storeTokenAndReturn(token: string, expiresIn: string, returnUrl: string){
        this.api.setAccessToken(token);
        localStorage.setItem('steemToken', token);
        console.log("Steem Access Token set in the api");
        this.api.me( (err, result) => 
        {
          if (!err)
          {
              localStorage.setItem('currentUser', result.account.name);
              localStorage.setItem('currentUserMetadata', JSON.stringify(result.user_metadata, null, 2));

              console.log("Current steem user and metadata stored");

              window.location.href = this.baseUrl +  returnUrl;
          }
        });
    }

     retrieveGithubUserAndReturn(temporaryCode: string, returnUrl: string){

         this.http.get<GithubUser[]>(this.baseUrl + 'api/Github/GetUser?temporaryCode=' + temporaryCode)
             .subscribe(
                 result =>
                 {
                     console.log("Github access Token stored in session storage");

                     var user = result.pop();

                     localStorage.setItem('githubUser', JSON.stringify(user));

                     console.log("Github user data stored in local storage");

                     window.location.href = this.baseUrl +  returnUrl;
                   },
                 error => console.error(error));
     }

     revokeGithubToken(callback : ()=>void){

         this.http.get(this.baseUrl + 'api/Github/RevokeToken')
             .toPromise().then(
                 result =>
                 {
                     localStorage.removeItem('githubUser');

                     callback();
                   },
                 error => console.error(error));
    }
}