import { Component, Inject, OnInit } from '@angular/core';
import { Observable } from "rxjs/Observable";
import * as steemconnect from 'steemconnect';
import * as steem from 'steem';
import 'rxjs/add/operator/first';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
    export class HomeComponent implements OnInit{
    
    public isAuth : boolean = false;

    public loading : boolean = false;

    public parentAuthor : string;

    public parentPermlink : string;

    public comments: Observable<any[]>;

    public message;

    private api;

    private user;

    private metadata;

    private userPreference;

    constructor(
        @Inject('STEEM_API') api: steemconnect)
    {
        console.log("Home Component : Constructor");
        this.api = api;
    }

    ngOnInit()
    {
        console.log("Home Component : Initialization");
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
}