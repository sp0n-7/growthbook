<p align="center"><a href="https://www.growthbook.io"><img src="https://cdn.growthbook.io/growthbook-logo@2x.png" width="400px" alt="GrowthBook - Open Source Feature Flagging and A/B Testing" /></a></p>
<p align="center"><b>Open Source Feature Flagging and A/B Testing</b></p>
<p align="center">
    <a href="https://github.com/growthbook/growthbook/github/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/growthbook/growthbook/ci.yml?branch=main" alt="Build Status" height="22"/></a>
    <a href="https://github.com/growthbook/growthbook/releases"><img src="https://img.shields.io/github/v/release/growthbook/growthbook?color=blue&sort=semver" alt="Release" height="22"/></a>
    <a href="https://slack.growthbook.io?ref=readme-badge"><img src="https://img.shields.io/badge/slack-join-E01E5A?logo=slack" alt="Join us on Slack" height="22"/></a>
</p>

## Development

See the [Contributing Guide](https://github.com/sp0n-7/growthbook/blob/main/CONTRIBUTING.md)

### Requirements

- MacOS or Linux (Windows may work too, but we haven't tested it)
- [NodeJS](https://nodejs.org/en/download/package-manager/) 18.x or above
  - Check version by running `node -v` on terminal
- [Yarn](https://classic.yarnpkg.com/en/docs/install)
- [Python](https://www.python.org/downloads/) 3.8+ (for the stats engine)
  - [scipy](https://scipy.org/install/)
  - [numpy](https://numpy.org/install/)
  - [pandas](https://pandas.pydata.org/docs/getting_started/install.html)
- [Docker](https://docs.docker.com/engine/install/) (for running MongoDB locally)

## Major Features

- 🏁 Feature flags with advanced targeting, gradual rollouts, and experiments
- 💻 SDKs for [React](https://docs.growthbook.io/lib/react), [Javascript](https://docs.growthbook.io/lib/js), [PHP](https://docs.growthbook.io/lib/php), [Ruby](https://docs.growthbook.io/lib/ruby), [Python](https://docs.growthbook.io/lib/python), [Go](https://docs.growthbook.io/lib/go), [Android](https://docs.growthbook.io/lib/kotlin), [iOS](https://docs.growthbook.io/lib/swift), and [more](https://docs.growthbook.io/lib)!
- 🆎 Powerful A/B test analysis with advanced statistics (CUPED, Sequential testing, Bayesian, SRM checks, and more)
- ❄️ Use your existing data stack - BigQuery, Mixpanel, Redshift, Google Analytics, [and more](https://docs.growthbook.io/app/datasources)
- ⬇️ Drill down into A/B test results by browser, country, or any other custom attribute
- 🪐 Export reports as a Jupyter Notebook!
- 📝 Document everything with screenshots and GitHub Flavored Markdown throughout
- 🔔 Webhooks and a REST API for building integrations

## Documentation and Support

View the [GrowthBook Docs](https://docs.growthbook.io) for info on how to configure and use the platform.

Join [our Slack community](https://slack.growthbook.io?ref=readme-support) if you get stuck, want to chat, or are thinking of a new feature.

Or email us at [hello@growthbook.io](mailto:hello@growthbook.io) if Slack isn't your thing.

We're here to help - and to make GrowthBook even better!

## License

GrowthBook is an Open Core product. The bulk of the code is under the permissive MIT license, and the `packages/enterprise` directory has its own separate commercial license.

View the `LICENSE` file in this repository for the full text and details.

![GrowthBook Repository Stats](https://repobeats.axiom.co/api/embed/13ffc63ec5ce7fe45efa95dd326d9185517f0a15.svg "GrowthBook Repository Stats")
