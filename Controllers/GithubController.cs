using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace gitsteemspa.Controllers
{
    [Route("api/[controller]")]
    public class GithubController : Controller
    {
        [HttpGet("[action]")]
        public IEnumerable<GithubUser> GetToken(string temporaryCode)
        {
            var clientSecret = Environment.GetEnvironmentVariable("GITHUB_CLIENT_SECRET");

            return new[] { new GithubUser { Token = "dsd", Name="vuvu" } };
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
        }
    }
}
