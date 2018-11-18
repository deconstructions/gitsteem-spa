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

    public loadingIssues : boolean = false;

    public loadingRepos : boolean = false;

    private api;

    constructor(
        @Inject('BASE_URL') baseUrl: string,
        @Inject('STEEM_API') api: steemconnect,
        private issuesService: IssuesService)
    {
        this.api = api;
    }

    ngOnInit() {
        this.loadingRepos = false;
        this.loadingIssues = false;
        this.user = localStorage.getItem('currentUser');
        this.loadAll();
    }

    loadIssues() {
         this.loadingIssues = true;
        this.issuesService.fetchIssues(
            (issues) =>
            {
                this.issues = issues;
                console.log("Issues loaded");
                this.loadingIssues = false;
            });
    }

    loadAll() {
        this.loadRepos();
        this.loadIssues();
    }

    loadRepos() {
         this.loadingRepos = true;
        this.issuesService.fetchRepos(
            (repos) =>
            {
                this.repos = repos;
                console.log("Repos loaded");
                 this.loadingRepos = false;
            });
    }

    public postIssue(issue: Issue) {
        console.log("Publishing issue to steem : ", issue);
        this.loadingIssues = true;
        var title = '[Steemconnect test] repo=' + issue.repoName + ' issue='+ issue.id;
        var message = issue.title + ' more details, rendered html body etc';
        var permlink = this.commentPermlink('issue-'+issue.id);
        console.log("Permlink: ", permlink);
        this.api.comment(this.user, 'gitsteemrepo-' + issue.repoId, this.user, permlink, title, message, '', (err, result) => {
          console.log(err, result);
          this.loadIssues();
        });
    };

     public postRepo(repo: Repo) {
        console.log("Publishing repo to steem : ", repo);
        this.loadingRepos = true;
        var title = '[Steemconnect test] ' + repo.name;
        var message = 'This post has been generated from the Github repository "' + repo.name;
        var permlink = 'gitsteemrepo-' + repo.id;
        console.log("Permlink: ", permlink);
        this.api.comment("", "gitsteem", this.user, permlink, title, message, '', (err, result) => {
          console.log(err, result);
          this.loadRepos();
          this.loadIssues();
        });
    };

    commentPermlink(permLink: string) {
      if (permLink.length > 255) {
        // pay respect to STEEMIT_MAX_PERMLINK_LENGTH
        permLink.substr(permLink.length - 255, permLink.length);
      }
      // permlinks must be lower case and not contain anything but
      // alphanumeric characters plus dashes
      return permLink.toLowerCase().replace(/[^a-z0-9-]+/g, "");
    }
}
