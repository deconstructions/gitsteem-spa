import { Component, Inject, OnInit } from '@angular/core';
import { IssuesService } from '../services/index';
import * as steemconnect from 'steemconnect';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html'
})
export class ExploreComponent implements OnInit{

    private loading: boolean;
    private issues: Issue[];
    private api;
    private user: string;

    constructor(
        private issuesService: IssuesService,
        @Inject('STEEM_API') api: steemconnect) {
        this.api = api;
       
    }

     ngOnInit() {
        this.loading = false;
        this.user = localStorage.getItem('currentUser');
        this.loadIssues();
     }

    loadIssues() {
        if (this.loading) {
            return;
        }

        this.loading = true;
        this.issuesService.fetchAllReposWithIssues(
            (repos) =>
            {
                var allIssues = new Array<Issue>();
                for (let repo of repos)
                 {
                     for (let issue of repo.issues.filter(i => i.issuePost))
                       {
                           allIssues.push(issue);
                       }
                 }

                this.issues = allIssues;

                console.log("Issues loaded");

                this.loading = false;
            });
    }

    public vote(author, permlink, weight) {
      this.api.vote(this.user, author, permlink, weight, (err, result) => {
        if (!err) {
          alert('You successfully voted for @' + author + '/' + permlink);
          console.log('You successfully voted for @' + author + '/' + permlink, err, result);
          this.loadIssues();
        } else {
          console.log(err);
        }
      });
    };
}
