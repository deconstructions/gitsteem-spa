using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Octokit;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace gitsteemspa.Controllers
{
    [Route("api/[controller]")]
    public class GithubController : Controller
    {
        [HttpGet("[action]")]
        public async Task<IEnumerable<GithubUser>> GetToken(string temporaryCode)
        {
            var clientSecret = Environment.GetEnvironmentVariable("GITHUB_CLIENT_SECRET");
            var clientId = "197e2e9b1b3104d1b7e5";
            var client = new GitHubClient(new ProductHeaderValue("Gitsteem.co"));

            var request = new OauthTokenRequest(clientId, clientSecret, temporaryCode);

            var token = await client.Oauth.CreateAccessToken(request);

            client.Credentials = new Credentials(token.AccessToken);

            var currentUser = await client.User.Current();

            return new[]
            { 
                new GithubUser
                {
                    Token = token.AccessToken,
                    Name=currentUser.Name,
                    AvatarUrl= currentUser.AvatarUrl
                }
            };
        }

        [HttpGet("[action]")]
        public async Task<IEnumerable<GitsteemIssue>> GetIssues(string token)
        {
            var client = new GitHubClient(new ProductHeaderValue("Gitsteem.co"))
            {
                Credentials = new Credentials(token)
            };

            var request = new IssueRequest
            {
                Filter = IssueFilter.All,
                State = ItemStateFilter.All
            };

            var issues = await client.Issue.GetAllForCurrent(request);

            return issues.Select(i => new GitsteemIssue
            {
                RepoName = i.Repository.Name,
                RepoId = i.Repository.Id,
                Title = i.Title,
                State = i.State.StringValue
            });
        }

        [HttpGet("[action]")]
        public async Task<IEnumerable<GitsteemRepo>> GetRepos(string token)
        {
            var client = new GitHubClient(new ProductHeaderValue("Gitsteem.co"))
            {
                Credentials = new Credentials(token)
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
            public string Token
            {
                get;
                set;
            }

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
