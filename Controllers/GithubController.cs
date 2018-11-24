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
        const string TokenSessionKey = "GITHUB_TOKEN";

        const string ClientIdEnvironmentKey = "GITHUB_CLIENT_ID";

        const string RedirectUriBaseEnvironmentKey = "GITHUB_REDIRECT_URI_BASE";

        const string ClientSecretEnvironmentKey = "GITHUB_CLIENT_SECRET";

        const string AppNameEnvironmentKey = "GITHUB_APP_NAME";

        [HttpGet("[action]")]
        public IActionResult StartAuthFlow()
        {
            var clientId = Environment.GetEnvironmentVariable(ClientIdEnvironmentKey);

            var redirectUriBase = Environment.GetEnvironmentVariable(RedirectUriBaseEnvironmentKey);

            return Redirect(
                "https://github.com/login/oauth/authorize?client_id="
                + clientId
                + "&redirect_uri="
                + redirectUriBase
                + "profile/&scope=public_repo%20read:user");
        }

        [HttpGet("[action]")]
        public Task RevokeToken()
        {
            HttpContext.Session.Remove(TokenSessionKey);
            Response.Cookies.Delete(".AspNetCore.Session");

            return Task.CompletedTask;
        }

        [HttpGet("[action]")]
        public async Task<IEnumerable<GithubUser>> GetUser(string temporaryCode)
        {
            var clientSecret = Environment.GetEnvironmentVariable(ClientSecretEnvironmentKey);
            var clientId = Environment.GetEnvironmentVariable(ClientIdEnvironmentKey);

            var client = new GitHubClient(
                new ProductHeaderValue(Environment.GetEnvironmentVariable(AppNameEnvironmentKey)));

            var request = new OauthTokenRequest(clientId, clientSecret, temporaryCode);
           
            var token = await client.Oauth.CreateAccessToken(request);

            HttpContext.Session.SetString(TokenSessionKey, token.AccessToken);

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

        private GitHubClient CreateAuthorizedClient()
        {
            return new GitHubClient(new ProductHeaderValue(Environment.GetEnvironmentVariable(AppNameEnvironmentKey)))
            {
                Credentials = new Credentials(HttpContext.Session.GetString(TokenSessionKey))
            };
        }

        [HttpGet("[action]")]
        public async Task<IEnumerable<GitsteemRepo>> GetRepos()
        {
            GitHubClient client = CreateAuthorizedClient();

            var currentUser = await client.User.Current();

            var request = new RepositoryRequest
            {
                Type = RepositoryType.Owner
            };

            var repos = await client.Repository.GetAllForCurrent(request);

            var issuesRequest = new IssueRequest
            {
                Filter = IssueFilter.All,
                State = ItemStateFilter.All
            };

            var issues = await client.Issue.GetAllForCurrent(issuesRequest);

            var mappedIssues = issues.Select(i => new GitsteemIssue
            {
                Id = i.Id,
                RepoName = i.Repository.Name,
                RepoId = i.Repository.Id,
                Title = i.Title,
                State = i.State.StringValue
            });

            return repos.Select(r => new GitsteemRepo
            {
                Issues = mappedIssues.Where(i => i.RepoId == r.Id).ToArray(),
                Name = r.Name,
                Id = r.Id,
                IsPosted = false
            });
        }

        public class GitsteemRepo
        {
            public GitsteemIssue[] Issues
            {
                get;
                set;
            }

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
