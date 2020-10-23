import semver from 'semver'

import _ from './lodash'
import { ApiBase } from './apiBase'

export interface LatestRelease {
  version: string,
  url: string,
  published: Date,
  changelog: string,
}

export class GithubApi extends ApiBase {
  constructor() {
    super('https://api.github.com/repos/erdDEVcode/sting', { alwaysViaBackend: true })
  }

  async getLatestRelease(): Promise<LatestRelease | null> {
    const data = await this._call(`/releases`, {
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    })

    const latest = _.get(data, '0')

    if (latest) {
      return {
        version: semver.clean(latest.name),
        url: latest.html_url,
        published: new Date(latest.published_at),
        changelog: latest.body,
      }
    } else {
      return null
    }
  }
}

export const githubApi = new GithubApi()