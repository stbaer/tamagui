import { existsSync } from 'fs'
import path, { dirname, join } from 'path'

import type { TamaguiOptions } from '@tamagui/static'
import browserslist from 'browserslist'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import buildResolver from 'esm-resolve'
import InlineCSSPlugin from 'html-inline-css-webpack-plugin'
import MiniCSSExtractPlugin from 'mini-css-extract-plugin'
import { lazyPostCSS } from 'next/dist/build/webpack/config/blocks/css'
import { getGlobalCssLoader } from 'next/dist/build/webpack/config/blocks/css/loaders'
import { shouldExclude as shouldExcludeDefault } from 'tamagui-loader'
import webpack from 'webpack'

export type WithTamaguiProps = TamaguiOptions & {
  useReactNativeWebLite: boolean
  disableFontSupport?: boolean
  aliasReactPackages?: boolean
  includeCSSTest?: RegExp | ((path: string) => boolean)
  inlineCSS?: boolean
  shouldExtract?: (path: string, projectRoot: string) => boolean | undefined
  shouldExcludeFromServer?: (props: {
    context: string
    request: string
    fullPath: string
  }) => boolean | string | undefined
}

export const withTamagui = (tamaguiOptions: WithTamaguiProps) => {
  return (nextConfig: any = {}) => {
    return {
      ...nextConfig,
      webpack: (webpackConfig: any, options: any) => {
        const { dir, config, dev, isServer } = options

        const resolver = buildResolver(join(dir, 'index.js'), {
          constraints: 'node',
        })

        // @ts-ignore
        if (typeof globalThis['__DEV__'] === 'undefined') {
          // @ts-ignore
          globalThis['__DEV__'] = dev
        }

        const isNext12 = typeof options.config?.swcMinify === 'boolean'
        if (!isNext12) {
          throw new Error(`Next.js 12 only supported`)
        }

        const prefix = `${isServer ? ' ssr ' : ' web '} |`

        const safeResolves = (...resolves: [string, string][]) => {
          const res: string[][] = []
          for (const [out, mod] of resolves) {
            if (out.endsWith('$')) {
              res.push([out, mod])
              continue
            }
            try {
              res.push([out, resolveEsm(mod)])
            } catch (err) {
              if (out.includes(`@gorhom/bottom-sheet`)) {
                continue
              }
              if (process.env.DEBUG?.startsWith('tamagui')) {
                // eslint-disable-next-line no-console
                console.log(prefix, `withTamagui skipping resolving ${out}`, err)
              }
            }
          }
          return Object.fromEntries(res)
        }

        const resolveEsm = (relativePath: string) => {
          if (isServer) return require.resolve(relativePath)
          const esm = resolver(relativePath)
          return esm ? path.join(dir, esm) : require.resolve(relativePath)
        }

        const SEP = path.sep

        // automatically compile our given components
        const componentsFullPaths = safeResolves(
          ...tamaguiOptions.components.map(
            (moduleName) => [moduleName, moduleName] as [string, string]
          )
        )

        const componentsBaseDirs = Object.entries(componentsFullPaths).map(
          ([_moduleName, fullPath]) => {
            let rootPath = dirname(fullPath as string)
            while (rootPath.length > 1) {
              const pkg = join(rootPath, 'package.json')
              const hasPkg = existsSync(pkg)
              if (hasPkg) {
                return rootPath
              } else {
                rootPath = join(rootPath, '..')
              }
            }
            throw new Error(`Couldn't find package.json in any path above: ${fullPath}`)
          }
        )

        function isInComponentModule(fullPath: string) {
          return componentsBaseDirs.some((componentDir) => fullPath.startsWith(componentDir))
        }

        // allows configuration
        const shouldExclude = (path: string, projectRoot: string) => {
          const res = tamaguiOptions.shouldExtract?.(path, projectRoot)
          if (typeof res === 'boolean') {
            return !res
          }
          if (isInComponentModule(path)) {
            return false
          }
          return shouldExcludeDefault(path, projectRoot)
        }

        const rnw = tamaguiOptions.useReactNativeWebLite
          ? 'react-native-web-lite'
          : 'react-native-web'

        const tamaguiAliases = safeResolves(
          ['@tamagui/core/reset.css', '@tamagui/core/reset.css'],
          ['@tamagui/core', '@tamagui/core'],
          ['react-native-svg', '@tamagui/react-native-svg'],
          // fixes https://github.com/kentcdodds/mdx-bundler/issues/143
          ['react/jsx-runtime.js', 'react/jsx-runtime'],
          ['react/jsx-runtime', 'react/jsx-runtime'],
          ['react/jsx-dev-runtime.js', 'react/jsx-dev-runtime'],
          ['react/jsx-dev-runtime', 'react/jsx-dev-runtime'],
          ['react-native-reanimated', 'react-native-reanimated'],
          ['react-native$', rnw],
          ['react-native-web$', rnw],
          ['@testing-library/react-native', '@tamagui/proxy-worm'],
          ['@gorhom/bottom-sheet$', '@gorhom/bottom-sheet'],
          // fix reanimated 3
          ['react-native/Libraries/Renderer/shims/ReactFabric', '@tamagui/proxy-worm'],
          ...(tamaguiOptions.aliasReactPackages
            ? ([
                ['react', 'react'],
                ['react-dom', 'react-dom'],
              ] as any)
            : [])
        )

        const alias = {
          ...(webpackConfig.resolve.alias || {}),
          ...tamaguiAliases,
        }

        if (process.env.DEBUG) {
          // eslint-disable-next-line no-console
          console.log('Tamagui alias:', alias)
        }

        if (process.env.ANALYZE === 'true') {
          Object.assign(webpackConfig.optimization, {
            concatenateModules: false,
          })
        }

        webpackConfig.resolve.alias = alias

        webpackConfig.plugins.push(
          new webpack.DefinePlugin({
            'process.env.IS_STATIC': '""',
            'process.env.TAMAGUI_TARGET': '"web"',
            __DEV__: JSON.stringify(dev),
          })
        )

        const excludeExports = tamaguiOptions.excludeReactNativeWebExports
        if (Array.isArray(excludeExports)) {
          if (excludeExports.includes('PressResponder')) {
            console.warn(
              `⚠️ Warning: as of beta 118, PressReponder shouldn't be excluded in excludeReactNativeWebExports`
            )
          }
          try {
            const regexStr = `react-native-web(-lite)?/.*(${excludeExports.join('|')}).*js`
            const regex = new RegExp(regexStr)
            // console.log(prefix, 'exclude', regexStr)
            webpackConfig.plugins.push(
              new webpack.NormalModuleReplacementPlugin(regex, resolveEsm('@tamagui/proxy-worm'))
            )
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn(
              `Invalid names provided to excludeReactNativeWebExports: ${excludeExports.join(', ')}`
            )
          }
        }

        if (process.env.IGNORE_TS_CONFIG_PATHS) {
          if (process.env.DEBUG) {
            // eslint-disable-next-line no-console
            console.log(prefix, 'ignoring tsconfig paths')
          }
          if (webpackConfig.resolve.plugins[0]) {
            delete webpackConfig.resolve.plugins[0].paths['@tamagui/*']
            delete webpackConfig.resolve.plugins[0].paths['tamagui']
          }
        }

        // TODO document and make configurable
        // replaces minifier with css-minimizer-webpack-plugin which handles deduping atomic styles
        if (!dev) {
          const cssMin = webpackConfig.optimization.minimizer.find((x) =>
            x.toString().includes('css-minimizer-plugin')
          )
          if (cssMin) {
            webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer.slice(
              cssMin.index,
              1
            )
          }
          webpackConfig.optimization.minimizer.push(new CssMinimizerPlugin())
        }

        webpackConfig.resolve.extensions = [
          ...new Set(['.web.tsx', '.web.ts', '.web.js', ...webpackConfig.resolve.extensions]),
        ]

        // look for compiled js with jsx intact as specified by module:jsx
        webpackConfig.resolve.mainFields.unshift('module:jsx')

        if (isServer) {
          const externalize = (context: string, request: string) => {
            const fullPath = request[0] === '.' ? path.join(context, request) : request

            if (tamaguiOptions.shouldExcludeFromServer) {
              const userRes = tamaguiOptions.shouldExcludeFromServer({
                context,
                request,
                fullPath,
              })
              if (userRes !== undefined) {
                return userRes
              }
            }

            if (isInComponentModule(fullPath)) {
              return false
            }

            if (fullPath.includes('react-native-web-lite')) {
              // always inline react-native-web-lite due to errors where next.js resolved the path to esm
              return false
            }

            // must inline react-native so we can alias to react-native-web
            if (fullPath === 'react-native' || fullPath.startsWith(`react-native${SEP}`)) {
              return false
            }

            if (
              // feather icons uses react-native-svg which needs to be aliased
              // fullPath.includes('/lucide-icons/') ||
              fullPath.startsWith('react-native-web') ||
              fullPath.includes(`node_modules${SEP}react-native-web`) ||
              new RegExp(`^(react-dom|react)${SEP}$`).test(fullPath)
            ) {
              return `commonjs ${fullPath}`
            }
            if (
              fullPath.startsWith('moti') ||
              fullPath.startsWith('solito') ||
              fullPath === 'tamagui' ||
              fullPath.startsWith('@tamagui') ||
              fullPath === 'react-native-safe-area-context' ||
              fullPath === 'expo-linear-gradient' ||
              fullPath.startsWith('@react-navigation') ||
              fullPath.startsWith('@gorhom')
            ) {
              return
            }
            if (/^@?react-native-/.test(request)) {
              return false
            }
            return true
          }

          // externalize react native things from bundle
          webpackConfig.externals = [
            ...webpackConfig.externals.map((external) => {
              if (typeof external !== 'function') {
                return external
              }
              // only runs on server
              return (ctx, cb) => {
                const isCb = typeof cb === 'function'
                const res = externalize(ctx.context, ctx.request)
                if (isCb) {
                  if (typeof res === 'string') {
                    return cb(null, res)
                  }
                  if (res) {
                    return external(ctx, cb)
                  }
                  return cb()
                }
                return !res
                  ? Promise.resolve(undefined)
                  : typeof res === 'string'
                  ? Promise.resolve(res)
                  : external(ctx)
              }
            }),
          ]
        }

        const cssRules = webpackConfig.module.rules.find(
          (rule) =>
            Array.isArray(rule.oneOf) &&
            rule.oneOf.some(
              ({ test }) =>
                typeof test === 'object' &&
                typeof test.test === 'function' &&
                test.test('filename.css')
            )
        ).oneOf

        const cssLoader = getGlobalCssLoader(
          // @ts-ignore
          {
            assetPrefix: options.config.assetPrefix || config.assetPrefix,
            future: nextConfig.future,
            experimental: nextConfig.experimental || {},
            isClient: !isServer,
            isServer,
            isDevelopment: dev,
          },
          // @ts-ignore
          () => lazyPostCSS(dir, getSupportedBrowsers(dir, dev)),
          []
        )

        if (cssRules) {
          if (!tamaguiOptions.disableFontSupport) {
            // fonts support
            cssRules.unshift({
              test: /\.(woff(2)?|eot|ttf|otf)(\?v=\d+\.\d+\.\d+)?$/,
              use: [
                {
                  loader: require.resolve('url-loader'),
                  options: {
                    limit: nextConfig.inlineFontLimit || 1024,
                    fallback: require.resolve('file-loader'),
                    publicPath: `${nextConfig.assetPrefix || ''}/_next/static/chunks/fonts/`,
                    outputPath: `${isServer ? '../' : ''}static/chunks/fonts/`,
                    name: '[name].[ext]',
                  },
                },
              ],
            })
          }

          const cssTest = tamaguiOptions.includeCSSTest ?? /\.css$/

          if (!dev) {
            const postCSSLoader = cssLoader[cssLoader.length - 1]
            // replace nextjs picky style rules with simple minicssextract
            cssRules.unshift({
              test: cssTest,
              use: [MiniCSSExtractPlugin.loader, 'css-loader', postCSSLoader],
              sideEffects: true,
            })
            webpackConfig.plugins.push(
              new MiniCSSExtractPlugin({
                filename: 'static/css/[contenthash].css',
                ignoreOrder: true,
              })
            )
            if (tamaguiOptions.inlineCSS) {
              webpackConfig.plugins.push(new InlineCSSPlugin())
            }
          } else {
            cssRules.unshift({
              test: cssTest,
              sideEffects: true,
              use: cssLoader,
            })
          }
        }

        const firstOneOfRule = webpackConfig.module.rules.findIndex((x) => x && !!x.oneOf)
        const oneOfJSRules: any[] = webpackConfig.module.rules[firstOneOfRule].oneOf
        const afterSWCLoaderIndex =
          oneOfJSRules.findIndex(
            (x) => x && x.use && x.use.loader === 'next-swc-loader' && x.issuerLayer !== 'api'
          ) + 1
        const swcLoader = oneOfJSRules[afterSWCLoaderIndex]

        // put an earlier loader where we just do tamagui stuff before regular swc
        oneOfJSRules.splice(
          afterSWCLoaderIndex,
          0,
          {
            test: /(bottom-sheet|react-native-reanimated).*\.[tj]sx?$/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-react'],
                  plugins: ['react-native-reanimated/plugin'],
                },
              },
            ],
          },
          {
            test: /\.(jsx?|tsx?)$/,
            exclude: (path: string) => shouldExclude(path, options.dir),
            use: [
              ...[].concat(swcLoader.use),
              {
                loader: 'tamagui-loader',
                options: tamaguiOptions,
              },
            ],
          }
        )

        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(webpackConfig, options)
        }

        return webpackConfig
      },
    }
  }
}

function getSupportedBrowsers(dir, isDevelopment) {
  let browsers
  try {
    browsers = browserslist.loadConfig({
      path: dir,
      env: isDevelopment ? 'development' : 'production',
    })
  } catch {}

  return browsers
}
