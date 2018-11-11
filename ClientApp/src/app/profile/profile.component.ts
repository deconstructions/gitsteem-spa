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

    private githubUser;

    private api : steemconnect;

    constructor(
        private route: ActivatedRoute,
        private authenticationService: AuthenticationService,
        @Inject('STEEM_API') api: steemconnect)
    {
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
                  console.log("Profile Component : retrieving Github token from query parameter");
                  this.authenticationService.retrieveGithubTokenAndReturn(params['code'],'profile');
             
              }
          });
    }

    ngOnInit()
    {
        console.log("Profile Component : Initialization");
      
        this.user = localStorage.getItem('currentUser');
        this.githubUser = localStorage.getItem('currentGithubUser');
        this.steemLoginUrl = this.api.getLoginURL();
        this.githubLoginUrl = "https://github.com/login/oauth/authorize?client_id=197e2e9b1b3104d1b7e5&redirect_uri=http://localhost:5000/profile/";
    }

    public logout()
    {
       this.api.revokeToken((err, result) => {

       if (err)
         {
             console.log(err);
         }
       else
        {
           localStorage.clear();
           delete this.user;
           delete this.githubUser;
           console.log('You successfully logged out');
        }
       });
    }
}
