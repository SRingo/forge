
var BASE_URL = 'https://developer-stg.api.autodesk.com'
var OAUTH_VERSION = 'v1'
var OSS_VERSION = 'v1'

module.exports = {

  clientConfig: {
    env: 'AutodeskStaging',
    host: 'localhost',
    port: 3000
  },

  serverConfig: {
    redirectUrl: 'https://autodesk-forge.herokuapp.com/api/auth/callback',
    authenticationUrl: '/authentication/' + OAUTH_VERSION + '/authorize',
    accessTokenUrl: '/authentication/' + OAUTH_VERSION + '/gettoken',
    baseUrl: BASE_URL,
    port: 3000,

    scope: [
      'data:create',
      'data:read',
      'data:write',
      'bucket:read',
      'bucket:create'
    ],
    credentials: {
      ConsumerKey: process.env.LMV_STG_CONSUMERKEY,
      ConsumerSecret: process.env.LMV_STG_CONSUMERSECRET
    },

    endPoints:{

      authenticate:     BASE_URL + '/authentication/' + OSS_VERSION + '/authenticate',
      getBucket:        BASE_URL + '/oss/' + OSS_VERSION + '/buckets/%s/details',
      createBucket:     BASE_URL + '/oss/' + OSS_VERSION + '/buckets',
      upload:           BASE_URL + '/oss/' + OSS_VERSION + '/buckets/%s/objects/%s',
      resumableUpload:  BASE_URL + '/oss/' + OSS_VERSION + '/buckets/%s/objects/%s/resumable',
      supported:        BASE_URL + '/viewingservice/' + OSS_VERSION + '/supported',
      register:         BASE_URL + '/viewingservice/' + OSS_VERSION + '/register',
      thumbnail:        BASE_URL + '/viewingservice/' + OSS_VERSION + '/thumbnails/%s',
      viewable:         BASE_URL + '/viewingservice/' + OSS_VERSION + '/%s',
      items:            BASE_URL + '/viewingservice/' + OSS_VERSION + '/items/%s'
    }
  }
}
