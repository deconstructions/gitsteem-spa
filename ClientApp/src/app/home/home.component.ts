import { Component, Inject, OnInit } from '@angular/core';
import { Observable } from "rxjs/Observable";
import * as steemconnect from 'steemconnect';
import * as steem from 'steem';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
    export class HomeComponent implements OnInit{

    public loginUrl : string = "";
    
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

    constructor(@Inject('STEEM_API') api: steemconnect, private route: ActivatedRoute) {
        this.api = api;
        route.queryParams.subscribe((params) => {
            console.log(params['access_token']);
            if (!this.isAuth) {
                this.expiresIn = params['expires_in'];

                this.api.setAccessToken(params['access_token']);
                this.api.me( (err, result) => 
                {
                    console.log(err);
                  if (!err)
                  {
                      this.user = result.account;
                      this.isAuth = true;
                      this.metadata = JSON.stringify(result.user_metadata, null, 2);
                  }
                });
            }
        });
    }

    ngOnInit()
    {
        this.loginUrl = this.api.getLoginURL();
        this.loading = false;
        this.parentAuthor = 'deconstruction';
        this.parentPermlink = 'the-dragon-above-the-clouds-pilatus-hike-part-6-the-skywalker';
       
    }

    public loadComments() {
        console.log(this);
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

    public logout(){
        this.api.revokeToken( (err, result) => {

            if (err) {
                console.log(err);
            }
            else {
                 console.log('You successfully logged out', err, result);
                  this.user = null;
            }
      });
    };
}