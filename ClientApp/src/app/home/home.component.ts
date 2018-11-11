import { Component, Inject, OnInit } from '@angular/core';
import { Observable } from "rxjs/Observable";
import * as steemconnect from 'steemconnect';
import * as steem from 'steem';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/first';
import { AuthenticationService } from '../services/index';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
    export class HomeComponent implements OnInit{
    
    public isAuth : boolean = false;

    public loading : boolean = false;

    public expiresIn;

    public parentAuthor : string;

    public parentPermlink : string;

    public comments: Observable<any[]>;

    public message;

    private api;

    private user;

    private metadata;

    private userPreference;

    private returnUrl: string;

    constructor(
        @Inject('STEEM_API') api: steemconnect,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService)
    {
        console.log("Home Component : Constructor");
        this.api = api;
        this.route.queryParams.subscribe((params) => {
            console.log("Home Component : Query parameters changed");
            if (params['access_token'])
            {
                console.log("Home Component : new token recieved from Steemconnect");
                console.log("Home Component : storing access token from query parameter");
                this.authenticationService.storeTokenAndReturn(params['access_token'], params['expires_in'],'');
            }
        });
    }

    ngOnInit()
    {
        console.log("Home Component : Initialization");
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.user = localStorage.getItem('currentUser');
        this.metadata = localStorage.getItem('currentUserMetadata')
        this.loading = false;
        this.parentAuthor = 'deconstruction';
        this.parentPermlink = 'the-dragon-above-the-clouds-pilatus-hike-part-6-the-skywalker';
       
    }

    public loadComments() {
        steem.api.getContentReplies(this.parentAuthor, this.parentPermlink, (err, result) => {
        if (!err) {
          this.comments = result;
        }
        else {
            console.log(err);
        }
      });
    };

    public comment() {
      this.loading = true;
      var permlink = steem.formatter.commentPermlink(this.parentAuthor, this.parentPermlink);
      this.api.comment(this.parentAuthor, this.parentPermlink, this.user.name, permlink, '', this.message, '', (err, result) => {
        console.log(err, result);
        this.message = '';
        this.loading = false;
        this.loadComments();
      });
    };

    public vote(author, permlink, weight) {
      this.api.vote(this.user.name, author, permlink, weight, (err, result) => {
        if (!err) {
          alert('You successfully voted for @' + author + '/' + permlink);
          console.log('You successfully voted for @' + author + '/' + permlink, err, result);
          this.loadComments();
        } else {
          console.log(err);
        }
      });
    };

    public updateUserMetadata(metadata) {
      this.api.updateUserMetadata(metadata, (err, result) => {
        if (!err) {
          alert('You successfully updated user_metadata');
          console.log('You successfully updated user_metadata', result);
          if (!err) {
            this.user = result.account;
            this.metadata = JSON.stringify(result.user_metadata, null, 2);
          }
        } else {
          console.log(err);
        }
      });
    };

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
            delete this.metadata;
            console.log('You successfully logged out');
        }
       });
    }
}