import { useEffect, useState } from 'react'
import semver from 'semver'

import { version } from '../../package.json'
import { doInterval } from '../utils/timer'
import { githubApi, LatestRelease } from '../utils/github'

interface UseUpdatesResult {
  latestRelease?: LatestRelease,
}

export const useUpdates = (): UseUpdatesResult => {
  const [ latestRelease, setLatestRelease ] = useState<LatestRelease>()

  // rates timer
  useEffect(() => {
    const timer = doInterval(async () => {
      try {
        const latestRelease = await githubApi.getLatestRelease()
        if (latestRelease && semver.gt(latestRelease.version, version)) {
          setLatestRelease(latestRelease)
        }
      } catch (err) {
        console.error(`Error checking for update: ${err.message}`)
        // TODO: show error to user
      }
    }, { delayMs: 1000 * 60 * 60 /* once per hour */, executeImmediately: true })

    return () => clearInterval(timer)
  }, [])

  return { latestRelease }
}
