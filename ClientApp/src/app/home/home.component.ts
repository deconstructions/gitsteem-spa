import { Component, Inject, OnInit } from '@angular/core';
import * as steemconnect from 'steemconnect';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
    export class HomeComponent implements OnInit{

    public loginUrl = "";
    
    public isAuth = false;

    public expiresIn;

    private api;

    private user;

    private metadata;

    constructor(@Inject('STEEM_API') api: steemconnect, private route: ActivatedRoute) {
        this.api = api;
        route.queryParams.subscribe((params) => {
            console.log(params['access_token']);
            if (!this.isAuth) {
                this.expiresIn = params['expires_in'];

                this.api.setAccessToken(params['access_token']);
                this.api.me(function (err, result)
                {
                    console.log(result);
                    console.log(err);
                  if (!err)
                  {
                      _this.user = result.account;
                      console.log(this.user)
                      _this.isAuth = true;
                      _this.metadata = JSON.stringify(result.user_metadata, null, 2);
                  }
                });
            }
        });
    }

    ngOnInit()
    {
        this.loginUrl = this.api.getLoginURL();
    }
}