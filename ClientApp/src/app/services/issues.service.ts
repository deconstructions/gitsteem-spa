import { Injectable, Inject} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import * as steemconnect from 'steemconnect';
import * as dsteem from 'dsteem';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import 'rxjs/add/operator/map';
 
@Injectable()
export class IssuesService {

    private api;

    private dSteemClient = new dsteem.Client('https://api.steemit.com');

    private baseUrl: string;

    constructor(
        private http: HttpClient,
        private router: Router,
        @Inject('STEEM_API') api: steemconnect,
        @Inject('BASE_URL') baseUrl: string)
    {
        this.api = api;
        this.baseUrl = baseUrl;
    }

    public fetchOwnReposWithIssues(callback: (repos: Repo[]) => void)
    {
        var currentUser = localStorage.getItem('currentUser');

        this.fetchUserReposWithIssues(currentUser, callback);
    }

     public fetchAllReposWithIssues(callback: (repos: Repo[]) => void)
     {
        const query = {
            tag: 'gitsteem',
            limit: 1,
            start_author: 'gitsteem',
            start_permlink: 'participants',
            };

         console.log("Fetching all posted issues...");

         this.dSteemClient.database.getDiscussions('blog', query).then(
             result => {
                 var participants = JSON.parse(result[0].body);

                 var allRepos = new Array<Repo>();

                 this.getUserReposWithIssuesRecursive(0, participants, allRepos, () => callback(allRepos));
             });
     }

    private getUserReposWithIssuesRecursive(
        counter: number, users: string[], allRepos: Repo[], finalCallback: () => void) {

        this.fetchUserReposWithIssues(users[counter], repos =>
        {
            for (let repo of repos)
             {
                 allRepos.push(repo);
             }

             if (counter == users.length - 1){
                 finalCallback();
             }
             else {
                 this.getUserReposWithIssuesRecursive(
                     counter + 1,
                     users,
                     allRepos,
                     finalCallback);
             }
        });
    }

    private fetchUserReposWithIssues(userName: string, callback: (repos: Repo[]) => void) {
        this.getReposPostedByUser(userName, postedRepos =>
        {
            this.getAllIssuesPostedByUser(userName, postedRepos.map(r => r.permlink), postedIssues => {
               console.log("Fetching repositories of ", userName);
               this.http.get<Repo[]>(this.baseUrl + 'api/Github/GetRepos')
               .subscribe(
                   result =>
                   {
                       for (let repo of result) {
                           repo.repoPost = postedRepos.find(r => r.permlink == 'gitsteemrepo-'+repo.id);

                           for (let issue of repo.issues) 
                           {
                               issue.repo = repo;
                               issue.issuePost = postedIssues.find(i => i.permlink == 'issue-'+ issue.id);
                           }
                       }

                      callback(result);
                   },
                   error => console.error(error));
                 });
        });
    }

    private getReposPostedByUser(userName: string ,callback: (postedRepos: Post[]) => void){
        const query = {
            tag: userName,
            limit: 100
        };

        console.log('Searching for posted repositories...');

        this.dSteemClient.database
            .getDiscussions('blog', query)
            .then(result =>{
                var filteredResults = result.filter(s => s.permlink.includes('gitsteemrepo-'));

                for (let repo of filteredResults)
                 {
                     console.log("Repo ",repo.title," has already been posted.");
                 }

                 var mappedResults = filteredResults.map(r => {
                    var repoPost : Post = {
                        title: r.title,
                        author: userName,
                        permlink: r.permlink,
                        votes: r.net_votes};

                     return repoPost;
                 });

                callback(mappedResults);

                })
            .catch(err => {
                console.log(err);
                alert(`Error:${err}, try again`);
                });
    }

     private getAllIssuesPostedByUser(userName: string, postedRepoPermalinks: string[],callback: (postedIssues: Post[]) => void){

        console.log('Searching for all posted issues...');
         var allIssues = new Array<Post>();

         this.getAllIssuesPostedByUserRecursive(0, userName, postedRepoPermalinks, allIssues, () =>
         {
             callback(allIssues);
         });
     }

    private getAllIssuesPostedByUserRecursive(counter: number, userName: string, postedRepoPermalinks: string[], allIssues: Array<Post>, finalCallback: () => void) {
        this.getIssuesPostedByUser(
            userName,
            postedRepoPermalinks[counter],
             (issuesForRepo) =>
             {
                 for (let issue of issuesForRepo)
                 {
                     console.log("Issue ", issue.title, " has already been posted in repo ", postedRepoPermalinks[counter]);
                     allIssues.push(issue);
                 }

                 if (counter == postedRepoPermalinks.length - 1){
                     finalCallback();
                 }
                 else {
                     this.getAllIssuesPostedByUserRecursive(
                         counter + 1,
                         userName,
                         postedRepoPermalinks,
                         allIssues,
                         finalCallback);
                 }
             });
    }

    private getIssuesPostedByUser(userName: string, postedRepoPermalink: string, callback: (postedIssues: Post[]) => void){

        let parentPermlink = postedRepoPermalink;

         console.log("Searching for posted issues for repo ", parentPermlink, " from author", userName," ...");

        this.dSteemClient.database.call(
            'get_content_replies', 
            [userName, parentPermlink])
            .then(result =>{

                var filteredResults = result.filter(s => s.permlink.includes('issue-'));

                console.log("Results: ", filteredResults);

                var mappedResults = filteredResults.map(r => {
                    var issue : Post = {
                        title: r.title,
                        author: userName,
                        permlink: r.permlink,
                        votes: r.net_votes}

                    return issue;
                });

                callback(mappedResults);

                })
            .catch(err => {
                console.log(err);
                alert(`Error:${err}, try again`);
                });
    }
}