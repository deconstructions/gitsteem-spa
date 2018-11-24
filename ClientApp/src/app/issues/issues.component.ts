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

    ngOnInit() {
        this.loading = false;
        this.user = localStorage.getItem('currentUser');
        this.load();
    }

    load() {
         this.loading = true;
        this.issuesService.fetchOwnReposWithIssues(
            (repos) =>
            {
                this.repos = repos;
                console.log("Repos loaded");

                var allIssues = new Array<Issue>();
                for (let repo of repos)
                 {
                     for (let issue of repo.issues)
                       {
                           allIssues.push(issue);
                       }
                 }
                this.issues = allIssues;
                console.log("Issues loaded");

                this.loading = false;
            });
    }

    public async postIssue(issue: Issue) {
        console.log("Publishing issue to steem : ", issue);
        this.loading = true;
        var title = '[Steemconnect test] repo=' + issue.repoName + ' issue='+ issue.id;
        var message = issue.title + ' more details, rendered html body etc';
        var permlink = this.commentPermlink('issue-'+issue.id);
        console.log("Permlink: ", permlink);

        var bountyHolderAccount ='gitsteem';

        console.log("Bounty holder : ", bountyHolderAccount);

        var beneficiaries: any[] = []; 
        beneficiaries.push({
            account: bountyHolderAccount,
            weight: 10000
        });

        var operations = [
            ['comment',
                {
                    parent_author: this.user,
                    parent_permlink: 'gitsteemrepo-' + issue.repoId,
                    author: this.user,
                    permlink: permlink,
                    title: title,
                    body: message,
                    json_metadata : JSON.stringify({
                    tags: 'gitsteem',
                    app: 'gitsteem-co'
                    })
                }
            ],
            ['comment_options', {
                author: this.user,
                permlink: permlink,
                max_accepted_payout: '100000.000 SBD',
                percent_steem_dollars: 0,
                allow_votes: true,
                allow_curation_rewards: true,
                extensions: [
                    [0, {
                        beneficiaries: beneficiaries
                    }]
                ]
            }]
        ];

        await this.api.broadcast(operations);

        this.load();
    };

     public postRepo(repo: Repo) {
        console.log("Publishing repo to steem : ", repo);
        this.loading = true;
        var title = '[Steemconnect test] ' + repo.name;
        var message = 'This post has been generated from the Github repository "' + repo.name;
        var permlink = 'gitsteemrepo-' + repo.id;
        console.log("Permlink: ", permlink);
        this.api.comment("", "gitsteem", this.user, permlink, title, message, '', (err, result) => {
          console.log(err, result);
          this.load();
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
