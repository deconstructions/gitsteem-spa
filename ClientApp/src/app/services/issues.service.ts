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

    getPostedRepos(callback: (postedRepoPermalinks: string[]) => void){
        const query = {
            tag: localStorage.getItem('currentUser'),
            limit: 100
        };

        console.log('Searching for posted repositories...');

        this.dSteemClient.database
            .getDiscussions('blog', query)
            .then(result =>{
                var filteredResults = result.map(d => d.permlink).filter(s => s.includes('gitsteemrepo-'));

                for (let repo of filteredResults)
                 {
                     console.log("Repo ",repo," has already been posted.");
                 }

                callback(filteredResults);

                })
            .catch(err => {
                console.log(err);
                alert(`Error:${err}, try again`);
                });
    }

     getAllPostedIssues(postedRepoPermalinks: string[],callback: (postedIssuePermalinks: string[]) => void){

        console.log('Searching for all posted issues...');
         var allIssues = new Array<string>();

         this.getAllPostedIssuesRecursive(0, postedRepoPermalinks, allIssues, () =>
         {
             callback(allIssues);
         });
     }

    getAllPostedIssuesRecursive(counter: number, postedRepoPermalinks: string[], allIssues: Array<string>, finalCallback: () => void) {
        this.getPostedIssues(
             postedRepoPermalinks[counter],
             (issuesForRepo) =>
             {
                 for (let issue of issuesForRepo)
                 {
                     console.log("Issue ", issue, " has already been posted in repo ", postedRepoPermalinks[counter]);
                     allIssues.push(issue);
                 }

                 if (counter == postedRepoPermalinks.length - 1){
                     finalCallback();
                 }
                 else {
                     this.getAllPostedIssuesRecursive(counter + 1, postedRepoPermalinks, allIssues, finalCallback);
                 }
             });
    }

    getPostedIssues(postedRepoPermalink: string,callback: (postedIssueIds: string[]) => void){

        let author = localStorage.getItem('currentUser');

        let parentPermlink = postedRepoPermalink;

         console.log("Searching for posted issues for repo ", parentPermlink, " from author", author," ...");

        this.dSteemClient.database.call(
            'get_content_replies', 
            [author, parentPermlink])
            .then(result =>{

                var filteredResults = result.map(d => d.permlink).filter(s => s.includes('issue-'));

                callback(filteredResults);

                })
            .catch(err => {
                console.log(err);
                alert(`Error:${err}, try again`);
                });
    }

    fetchOwnReposWithIssues(callback: (repos: Repo[]) => void)
    {
        this.getPostedRepos(postedRepoPermalinks =>
        {
            this.getAllPostedIssues(postedRepoPermalinks, postedIssuePermalinks => {
               console.log("Fetching own repositories");
               this.http.get<Repo[]>(this.baseUrl + 'api/Github/GetRepos')
               .subscribe(
                   result =>
                   {
                       for (let repo of result) {
                           repo.isPosted = postedRepoPermalinks.indexOf('gitsteemrepo-'+repo.id) > -1;

                           for (let issue of repo.issues) 
                           {
                               issue.isRepoPosted = repo.isPosted;
                               issue.isPosted = postedIssuePermalinks.indexOf('issue-'+ issue.id) >  -1;
                           }
                       }

                      callback(result);
                   },
                   error => console.error(error));
                 });
        });
    }
}