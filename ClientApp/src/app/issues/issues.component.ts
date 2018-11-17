import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import { IssuesService } from '../services/index';
import * as steemconnect from 'steemconnect';

@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html'
})
export class IssuesComponent implements OnInit {

    public issues: Issue[];

    public repos: Repo[];

    private user;

    public loading : boolean = false;

    private api;

    constructor(
        @Inject('BASE_URL') baseUrl: string,
        @Inject('STEEM_API') api: steemconnect,
        private issuesService: IssuesService)
    {
        this.api = api;
    }

    loadIssues() {
         this.loading = true;
        this.issuesService.fetchIssues(
            (issues) =>
            {
                this.issues = issues;
                console.log("Issues loaded");
                 this.loading = false;
            });
    }

    loadRepos() {
         this.loading = true;
        this.issuesService.fetchRepos(
            (repos) =>
            {
                this.repos = repos;
                console.log("Repos loaded");
                 this.loading = false;
            });
    }

    ngOnInit() {
        this.loading = false;
        this.user = localStorage.getItem('currentUser');
    }

    public postIssue(issue: Issue) {
        console.log("Publishing issue to steem : ", issue);
        this.loading = true;
        var message = issue.title + ' more details, rendered html body etc';
        var permlink = this.commentPermlink(issue.title);
        console.log("Permlink: ", permlink);
        this.api.comment(this.user, "myCategory", this.user, permlink, '', message, '', (err, result) => {
          console.log(err, result);
          this.loading = false;
          this.loadIssues();
        });
    };

     public postRepo(repo: Repo) {
        console.log("Publishing repo to steem : ", repo);
        this.loading = true;
        var title = '[Steemconnect test] ' + repo.name;
        var message = 'This post has been generated from the Github repository "' + repo.name + '": more details, include readme markdown';
        var permlink = this.commentPermlink(repo.name);
        console.log("Permlink: ", permlink);
        this.api.comment("", "my-category", this.user, permlink, title, message, '', (err, result) => {
          console.log(err, result);
          this.loading = false;
          this.loadRepos();
        });
    };

    commentPermlink(parentPermlink: string) {
      const timeStr = new Date()
        .toISOString()
        .replace(/[^a-zA-Z0-9]+/g, "")
        .toLowerCase();
      parentPermlink = parentPermlink.replace(/(-\d{8}t\d{9}z)/g, "");
      let permLink =
        parentPermlink + "-" + timeStr;
      if (permLink.length > 255) {
        // pay respect to STEEMIT_MAX_PERMLINK_LENGTH
        permLink.substr(permLink.length - 255, permLink.length);
      }
      // permlinks must be lower case and not contain anything but
      // alphanumeric characters plus dashes
      return permLink.toLowerCase().replace(/[^a-z0-9-]+/g, "");
    }
}
