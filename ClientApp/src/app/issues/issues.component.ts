import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import { IssuesService } from '../services/index';

@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html'
})
export class IssuesComponent {

    public issues: Issue[];

    constructor(
        @Inject('BASE_URL') baseUrl: string,
        private issuesService: IssuesService) {}

    loadIssues() {
        this.issuesService.fetchIssues(
            (issues) =>
            {
                this.issues = issues;
                console.log("Issues loaded");
            });
    }
}
