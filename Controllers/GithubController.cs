using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Octokit;

namespace gitsteemspa.Controllers
{
    [Route("api/[controller]")]
    public class GithubController : Controller
    {
        [HttpGet("[action]")]
        public IActionResult StartAuthFlow()
        {
            var clientId = Environment.GetEnvironmentVariable("GITHUB_CLIENT_ID");

            var redirectUriBase = Environment.GetEnvironmentVariable("GITHUB_REDIRECT_URI_BASE");

            return Redirect(
                "https://github.com/login/oauth/authorize?client_id="
                + clientId
                + "&redirect_uri="
                + redirectUriBase
                + "profile/&scope=public_repo%20read:user");
        }

        [HttpGet("[action]")]
        public async Task<IEnumerable<GithubUser>> GetUser(string temporaryCode)
        {
            var clientSecret = Environment.GetEnvironmentVariable("GITHUB_CLIENT_SECRET");
            var clientId = Environment.GetEnvironmentVariable("GITHUB_CLIENT_ID");

            var client = new GitHubClient(
                new ProductHeaderValue(Environment.GetEnvironmentVariable("GITHUB_APP_NAME")));

            var request = new OauthTokenRequest(clientId, clientSecret, temporaryCode);
           
            var token = await client.Oauth.CreateAccessToken(request);

            HttpContext.Session.SetString("GITHUB_TOKEN", token.AccessToken);

            client.Credentials = new Credentials(token.AccessToken);

            var currentUser = await client.User.Current();

            return new[]
            { 
                new GithubUser
                {
                    Name=currentUser.Name,
                    AvatarUrl= currentUser.AvatarUrl
                }
            };
        }

        [HttpGet("[action]")]
        public async Task<IEnumerable<GitsteemIssue>> GetIssues()
        {
            var client = new GitHubClient(new ProductHeaderValue("Gitsteem.co"))
            {
                Credentials = new Credentials(HttpContext.Session.GetString("GITHUB_TOKEN"))
            };

            var request = new IssueRequest
            {
                Filter = IssueFilter.All,
                State = ItemStateFilter.All
            };

            var issues = await client.Issue.GetAllForCurrent(request);

            return issues.Select(i => new GitsteemIssue
            {
                Id= i.Id,
                RepoName = i.Repository.Name,
                RepoId = i.Repository.Id,
                Title = i.Title,
                State = i.State.StringValue
            });
        }

        [HttpGet("[action]")]
        public async Task<IEnumerable<GitsteemRepo>> GetRepos()
        {
            var client = new GitHubClient(new ProductHeaderValue("Gitsteem.co"))
            {
                Credentials = new Credentials(HttpContext.Session.GetString("GITHUB_TOKEN"))
            };

            var currentUser = await client.User.Current();

            var request = new RepositoryRequest
            {
                Type = RepositoryType.Owner
            };

            var repos = await client.Repository.GetAllForCurrent(request);

            return repos.Select(i => new GitsteemRepo
            {
                Name = i.Name,
                Id = i.Id,
                IsPosted = false
            });
        }

        public class GitsteemRepo
        {
            public string Name
            {
                get;
                set;
            }

            public long Id
            {
                get;
                set;
            }

            public bool IsPosted
            {
                get;
                set;
            }
        }

        public class GitsteemIssue
        {
            public long Id
            {
                get;
                set;
            }

            public string Title
            {
                get;
                set;
            }

            public string RepoName
            {
                get;
                set;
            }

            public long RepoId
            {
                get;
                set;
            }

            public string State
            {
                get;
                set;
            }

            public bool IsPosted
            {
                get;
                set;
            }

            public bool IsRepoPosted
            {
                get;
                set;
            }
        }

        public class GithubUser
        {
            public string Name
            {
                get;
                set;
            }

            public string AvatarUrl
            {
                get;
                set;
            }
        }
    }
}
