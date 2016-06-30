
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import { OAuth2 } from 'oauth'
import express from 'express'

module.exports = function() {

  var router = express.Router()

  var oauth2 = new OAuth2(
    config.forge.oauth.clientId,
    config.forge.oauth.clientSecret,
    config.forge.oauth.baseUri,
    config.forge.oauth.authenticationUri,
    config.forge.oauth.accessTokenUri,
    null)

  /////////////////////////////////////////////////////////////////////////////
  // login endpoint
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/login', function (req, res) {

    var authURL = oauth2.getAuthorizeUrl({
      redirect_uri: config.forge.oauth.redirectUri,
      scope: config.forge.oauth.scope.join(' ')
    })

    res.json(authURL + '&response_type=code')
  })

  /////////////////////////////////////////////////////////////////////////////
  // Reply looks as follow:
  //
  //  access_token: "fk7dd21P4FAhJWl6MptumGkXIuei",
  //  refresh_token: "TSJpg3xSXxUEAtevo3lIPEmjQUxXbcqNT9AZHRKYM3",
  //  results: {
  //    token_type: "Bearer",
  //    expires_in: 86399,
  //    access_token: "fk7dd21P4FAhJWl6MptumGkXIuei"
  //  }
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/oauth/callback', function (req, res) {

    if(!req.query || !req.query.code) {

      res.json('invalid request')
      return
    }

    oauth2.getOAuthAccessToken(
      req.query.code, {
        grant_type: 'authorization_code',
        redirect_uri: config.forge.oauth.redirectUri
      },
      function (err, access_token, refresh_token, results) {

        try {

          var forgeSvc = ServiceManager.getService(
            'ForgeSvc')

          var socketSvc = ServiceManager.getService(
            'SocketSvc')

          var token = {
            expires_in: results.expires_in,
            refresh_token: refresh_token,
            access_token: access_token,
            scope: config.forge.oauth.scope
          }

          forgeSvc.setToken(req.sessionID, token)

          var scope = [
            'data:read'
          ]

          forgeSvc.refreshToken(token, scope.join(' ')).then(
            function(clientToken) {

              clientToken.scope = scope

              forgeSvc.setClientToken(
                req.sessionID, clientToken)

              if(req.session.socketId) {

                socketSvc.broadcast(
                  'callback', 'done',
                  req.session.socketId)
              }

              res.end('success')
            })
        }
        catch(ex){

          res.status(500)
          res.end(ex)
        }
      }
    )
  })

  /////////////////////////////////////////////////////////////////////////////
  // logout route
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/logout', function (req, res) {

    var forgeSvc = ServiceManager.getService(
      'ForgeSvc')

    forgeSvc.deleteToken(req.sessionID)

    res.json('success')
  })

  ///////////////////////////////////////////////////////////////////////////
  // 3-legged token
  //
  ///////////////////////////////////////////////////////////////////////////
  router.get('/3legged', function(req, res) {

    try {

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = forgeSvc.getClientToken(
        req.sessionID)

      res.json(token)
    }
    catch (error) {

      console.log(error)

      res.status(error.statusCode || 404)
      res.json(error)
    }
  })

  return router
}