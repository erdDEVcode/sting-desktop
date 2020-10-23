const path = require('path')
const minimatch = require('minimatch')
const fs = require('fs')

const { author, version, description, homepage, productName } = require('./package.json')

const PATHS_TO_INCLUDE = [
  '/build',
  '/build/**',
  '/electron',
  '/electron/**',
  '/common',
  '/common/**',
  '/node_modules',
  '/node_modules/**',
  '/package.json',
  '/LICENSE.md',
]

const EXTS_TO_IGNORE = ['map', 'o', 'obj']

const shouldInclude = filePath => PATHS_TO_INCLUDE.reduce((soFar, p) => {
  return soFar || minimatch(filePath, p)
}, false)

const linuxPkgConfig = {
  compressionLevel: 9,
  maintainer: author,
  description,
  productDescription: description,
  productName,
  name: productName,
  version,
  homepage,
  icon: path.join(__dirname, 'electron', 'images', 'logo.png'),
  license: "AGPLv3",
}

module.exports = {
  makers: [
    {
      "name": "@electron-forge/maker-deb",
      "config": {
        ...linuxPkgConfig,
      },
      platforms: ['linux']
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['linux', 'win32', 'darwin']
    },
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        overwrite: true,
        icon: path.join(__dirname, 'electron', 'images', 'logo.png'),
        background: path.join(__dirname, 'build-tools', 'packaging', 'dmg', 'background.png'),
      }
    },
    // {
    //   name: '@electron-forge/maker-squirrel',
    //   platforms: ['win32'],
    //   config: {
    //     name: productName,
    //     setupExe: `${productName} Setup`,
    //     setupMsi: `${productName} Installer`,
    //     setupIcon: path.join(__dirname, 'electron', 'images', 'logo.ico'),
    //   }
    // }
  ],
  packagerConfig: {
    appCopyright: 'Copyright (c) erdDEV team',
    appCategoryType: 'public.app-category.finance',
    prune: true,
    icon: path.join(__dirname, 'electron', 'images', 'logo'),
    ignore: filePath => {
      let ret

      if ('' === filePath) {
        ret = false
      } else if (EXTS_TO_IGNORE.includes(path.extname(filePath).substr(1))) {
        ret = true
      } else {
        ret = !shouldInclude(filePath)
      }

      return ret
    }
  },
  hooks: {
    packageAfterCopy: async (cfg, appDir/*, electronVersion, platform, arch */) => {
      console.log(`Writing buildConfig.json for prod...`)

      fs.writeFileSync(path.join(appDir, 'buildConfig.json'), JSON.stringify({
        mode: 'prod'
      }), 'utf8')
    }
  }
}


