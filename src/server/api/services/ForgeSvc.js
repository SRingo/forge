
import BaseSvc from './BaseSvc'
import request from 'request'
import util from 'util'

export default class ForgeSvc extends BaseSvc {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor (opts) {

    super(opts)

    this.tokenStore = {}
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name () {

    return 'ForgeSvc'
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  setToken (sessionId, token) {

    if(!this.tokenStore[sessionId]) {

      this.tokenStore[sessionId] = {
        masterToken: null,
        clientToken: null
      }
    }

    this.tokenStore[sessionId].masterToken = token
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getToken (sessionId) {

    return this.tokenStore[sessionId].masterToken
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  setClientToken (sessionId, token) {

    this.tokenStore[sessionId].clientToken = token
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getClientToken (sessionId) {

    return this.tokenStore[sessionId].clientToken
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  refreshToken (token, scope) {

    return new Promise((resolve, reject) => {

      var url = this._config.oauth.baseUri +
        this._config.oauth.refreshTokenUri

      request({
        url: url,
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        json: true,
        form: {
          client_id: this._config.oauth.clientId,
          client_secret: this._config.oauth.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: token.refresh_token,
          scope: scope
        }
      }, (err, response, body) => {

        try {

          if (err) {

            console.log('error: ' + url)
            console.log(err)

            return reject(err)
          }

          if (body && body.errors) {

            console.log('body error: ' + url)
            console.log(body.errors)

            return reject(body.errors)
          }

          if([200, 201, 202].indexOf(
              response.statusCode) < 0){

            return reject(response)
          }

          return resolve(body.data || body)
        }
        catch(ex){

          console.log(url)
          console.log(ex)

          return reject(response)
        }
      })
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  deleteToken (sessionId) {

    if (this.tokenStore[sessionId]) {

      delete this.tokenStore[sessionId]
    }
  }
}
