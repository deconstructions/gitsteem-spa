import { Component, Inject, OnInit } from '@angular/core';
import { IssuesService } from '../services/index';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html'
})
export class ExploreComponent implements OnInit{

    private loading: boolean;
    private issuePosts: IssuePost[];

    constructor(
        private issuesService: IssuesService) {

    }

     ngOnInit() {
        this.loading = false;
        this.loadIssuePosts();
     }

    loadIssuePosts() {
        this.loading = true;
        this.issuesService.fetchAllPostedIssues(
            (issuePosts) =>
            {
                this.issuePosts = issuePosts;

                console.log("Posted issues loaded");

                this.loading = false;
            });
    }
}
