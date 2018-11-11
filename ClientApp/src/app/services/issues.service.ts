import { Injectable, Inject} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import * as steemconnect from 'steemconnect';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import 'rxjs/add/operator/map';
 
@Injectable()
export class IssuesService {

    private api;

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
        console.log("Fetching issues");
        let user:GithubUser = JSON.parse(localStorage.getItem('githubUser'));
        this.http.get<Issue[]>(this.baseUrl + 'api/Github/GetIssues?token=' + user.token)
           .subscribe(
               result =>
               {
                  callback(result);
               },
               error => console.error(error));
    }
}