import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../services/index';
import * as steemconnect from 'steemconnect';

@Component({
  selector: 'app-profile-component',
  templateUrl: './profile.component.html'
  })

export class ProfileComponent implements OnInit {

    public steemLoginUrl: string;

    public githubLoginUrl: string;

    private user;
   
    private baseUrl: string;

    private githubUser: GithubUser;

    private api : steemconnect;

    constructor(
        private route: ActivatedRoute,
        private authenticationService: AuthenticationService,
        @Inject('STEEM_API') api: steemconnect,
        @Inject('BASE_URL') baseUrl: string)
    {
        this.baseUrl = baseUrl;
        this.api = api;
        this.route.queryParams.subscribe((params) => {
              console.log("Profile Component : Query parameters changed");
              if (params['access_token'])
              {
                  console.log("Profile Component : new token recieved from Steemconnect");
                  console.log("Profile Component : storing Steemconnect token from query parameter");
                  this.authenticationService.storeTokenAndReturn(params['access_token'], params['expires_in'],'profile');
              }
              else if(params['code']){
                  console.log("Profile Component : new token recieved from Github");
                  console.log("Profile Component : retrieving Github user from query parameter");
                  this.authenticationService.retrieveGithubUserAndReturn(params['code'],'profile');
             
              }
          });
    }

    ngOnInit()
    {
        console.log("Profile Component : Initialization");
      
        this.user = localStorage.getItem('currentUser');
        this.githubUser = JSON.parse(localStorage.getItem('githubUser'));
        this.steemLoginUrl = this.api.getLoginURL();
        this.githubLoginUrl = this.baseUrl + 'api/Github/StartAuthFlow';
    }

    public logoutSteem()
    {
       this.api.revokeToken((err, result) => {

       if (err)
         {
             console.log(err);
         }
       else
        {
           localStorage.removeItem('currentUser');
           localStorage.removeItem('currentUserMetadata');
           localStorage.removeItem('steemToken');

           delete this.user;
           console.log('You successfully logged out of Steem');
        }
       });
    }

    public logoutGithub()
    {
        localStorage.removeItem('githubUser');
        delete this.githubUser;
        console.log('You successfully logged out of Github');
    }
}
