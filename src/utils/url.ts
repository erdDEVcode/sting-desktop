export const getReleasePageUrl = (version: string): string => {
  return `https://github.com/erdDEVcode/sting/releases/tag/v${version}`
}

export const extractDappId = (url: string): string => {
  const u = new URL(url)
  return `${u.hostname}:${u.port}`
}