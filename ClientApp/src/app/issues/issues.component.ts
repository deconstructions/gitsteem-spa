import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import { IssuesService } from '../services/index';
import * as steem from 'steem';

@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html'
})
export class IssuesComponent implements OnInit {

    public issues: Issue[];

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
        this.issuesService.fetchIssues(
            (issues) =>
            {
                this.issues = issues;
                console.log("Issues loaded");
            });
    }

    ngOnInit() {
        this.loading = false;
        this.user = localStorage.getItem('currentUser');
    }

    public comment(issue: Issue) {
        console.log("Publishing to steem : ", issue);
        this.loading = true;
        var message = issue.title + ' more details, rendered html body etc';
        var permlink = this.commentPermlink(issue.title);
        console.log("Permlink: ", permlink);
        this.api.comment("", "myCategory", this.user, permlink, '', message, '', (err, result) => {
          console.log(err, result);
          this.loading = false;
          this.loadIssues();
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
