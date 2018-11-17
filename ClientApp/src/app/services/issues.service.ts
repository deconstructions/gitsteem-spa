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

    fetchIssues(callback: (issues: Issue[]) => void)
    {
        this.getPostedRepos(postedRepoIds =>
        {
            console.log("Fetching issues");
            let user:GithubUser = JSON.parse(localStorage.getItem('githubUser'));
            this.http.get<Issue[]>(this.baseUrl + 'api/Github/GetIssues?token=' + user.token)
               .subscribe(
                   result =>
                   {
                       for (let entry of result) {
                           entry.isRepoPosted = postedRepoIds.includes('gitsteemrepo-'+entry.repoId);
                       }

                       callback(result);
                   },
                   error => console.error(error));
        });
    }

    getPostedRepos(callback: (postedRepoIds: string[]) => void){
        const query = {
            tag: 'deconstruction',
            limit: 10
        };

        console.log('Searching for posted repositories....\nFilter:', 'created', '\nQuery:', query);

        this.dSteemClient.database
            .getDiscussions('blog', query)
            .then(result => callback(result.map(d => d.permlink).filter(s => s.includes('gitsteemrepo'))))
            .catch(err => {
                console.log(err);
                alert(`Error:${err}, try again`);
                });
    }

    fetchRepos(callback: (repos: Repo[]) => void)
    {
        this.getPostedRepos(postedRepoIds =>
        {
            console.log("Fetching repositories");
            let user:GithubUser = JSON.parse(localStorage.getItem('githubUser'));

            this.http.get<Repo[]>(this.baseUrl + 'api/Github/GetRepos?token=' + user.token)
           .subscribe(
               result =>
               {
                    for (let entry of result) {
                           entry.isPosted = postedRepoIds.includes('gitsteemrepo-'+entry.id);
                    }

                  callback(result);
               },
               error => console.error(error));
        });
    }
}