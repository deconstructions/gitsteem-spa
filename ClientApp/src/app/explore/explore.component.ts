import { Component, Inject, OnInit } from '@angular/core';
import { IssuesService } from '../services/index';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html'
})
export class ExploreComponent implements OnInit{

    private loading: boolean;
    private issues: Issue[];

    constructor(
        private issuesService: IssuesService) {

    }

     ngOnInit() {
        this.loading = false;
        this.loadIssues();
     }

    loadIssues() {
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
}
