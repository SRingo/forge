//////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2014 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
//////////////////////////////////////////////////////////////////////////
import 'babel-polyfill'
import 'Viewing.Extension.ModelTransformer/Viewing.Extension.ModelTransformer'
import 'Viewing.Extension.A360View/Viewing.Extension.A360View'
import {clientConfig as config} from 'c0nfig'
import ioClient from 'socket.io-client'
import 'bootstrap-webpack'
import './styles/app.css'

class App {

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  getToken (url) {

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send(null);

    var response = JSON.parse(xhr.responseText);

    return response.access_token;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  register (socketId) {

    $.ajax({
      url: '/api/auth/register',
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({ socketId: socketId }),
      success: (url) => {

      },
      error: (err) => {

        console.log(err)
      }
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  login() {

    //this.viewer.loadExtension(
    //  'Viewing.Extension.A360View', {
    //    parentControl: this.ctrlGroup,
    //    showPanel: false
    //  })
    //
    //this.a360View =
    //  this.viewer.loadedExtensions['Viewing.Extension.A360View']
    //
    //this.a360View.on('item.dblClick', (data)=> {
    //
    //  this.importModelFromItem(data)
    //})
    //
    //return

    $.ajax({
      url: '/api/auth/login',
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: null,
      success: (url) => {

        // iframes are not allowed
        this.popup = this.PopupCenter(url, "Autodesk Login", 800, 400);

        if(this.popup){

          this.popup.focus()
        }
      },
      error: (err) => {

        console.log(err)
      }
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  logout() {

    $.ajax({
      url: '/api/auth/logout',
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: null,
      success: (res) => {

        console.log(res)
      },
      error: (err) => {

        console.log(err)
      }
    });
  }

  //////////////////////////////////////////////////////////////////////////
  // http://stackoverflow.com/questions/4068373/center-a-popup-window-on-screen
  //
  //////////////////////////////////////////////////////////////////////////
  PopupCenter(url, title, w, h) {

    // Fixes dual-screen position
    var dualScreenLeft = (window.screenLeft !== undefined ?
      window.screenLeft : screen.left)

    var dualScreenTop = (window.screenTop !== undefined ?
      window.screenTop : screen.top)

    var element = document.documentElement;

    var width = window.innerWidth ? window.innerWidth :
      (element.clientWidth ? element.clientWidth : screen.width)

    var height = window.innerHeight ? window.innerHeight :
      (element.clientHeight ? element.clientHeight : screen.height)

    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;

    return window.open(url, title,
      'scrollbars=no,' +
      'toolbar=no,' +
      'location=no,' +
      'titlebar=no,' +
      'directories=no,' +
      'status=no,' +
      'menubar=no,' +
      'width=' + w + ',' +
      'height=' + h + ',' +
      'top=' + top + ',' +
      'left=' + left);
  }

  //////////////////////////////////////////////////////////////////////////
  // on html document loaded
  //
  //////////////////////////////////////////////////////////////////////////
  initialize () {

    $('#loginBtn').click((e) => {

      this.login()
    })

    var options = {

      env: config.env,

      refreshToken: () => {
        return this.getToken('/api/token/2legged')
      },

      getAccessToken: () => {
        return this.getToken('/api/token/2legged')
      }
    }

    Autodesk.Viewing.Initializer(options, () => {

      var viewerContainer = document.getElementById('viewer')

      this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(
        viewerContainer)

      this.viewer.initialize()

      $('#loader').remove()
      $('.viewer > .spinner').remove()

      this.socket = ioClient.connect(
        `${config.host}:${config.port}`, {
          reconnect: true
        });

      this.socket.on('connect', ()=> {

        console.log('client socket connected');
      });

      this.socket.on('connection.data', (data)=> {

        this.register(data.socketId)
      });

      this.socket.on('callback', (msg)=> {

        if(this.popup) {

          this.popup.close()
          this.popup = null

          $.get('/api/dm/user', (user) => {

            var username = user.firstName + ' ' + user.lastName

            $('#loginText').text(username)
            $('#loginItem').addClass('active')
          })

          this.viewer.loadExtension(
            'Viewing.Extension.A360View', {
              parentControl: this.ctrlGroup,
              showPanel: true
            })

          this.a360View =
            this.viewer.loadedExtensions['Viewing.Extension.A360View']

          this.a360View.on('item.dblClick', (item)=> {

            this.importModelFromItem(item)
          })
        }
      });

      var viewerToolbar = this.viewer.getToolbar(true);

      this.ctrlGroup = new Autodesk.Viewing.UI.ControlGroup(
        'forge-dm-aggregator');

      viewerToolbar.addControl(this.ctrlGroup);
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  importModelFromItem (item) {

    console.log(item)

    if (!item.versions || !item.versions.length) {

      console.log('No item version available...')
      return
    }

    var urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YWRuLWJ1Y2tldC1ucG0tZGV2L3Rlc3QuZHdm'

    var tokenResponse = this.getToken('/api/token/3legged')

    //var urn = item.versions[0].relationships.derivatives.data.id

    Autodesk.Viewing.Private.refreshToken(tokenResponse.access_token)

    console.log(urn)

    Autodesk.Viewing.Document.load('urn:' + urn, async(LMVDocument) => {

      var rootItem = LMVDocument.getRootItem();

      // Grab all 3D items
      var geometryItems3d = Autodesk.Viewing.Document.getSubItemsWithProperties(
        rootItem, { 'type': 'geometry', 'role': '3d' },
        true);

      // Pick the first 3D item
      if (geometryItems3d.length) {

        if(!this.viewer) {

          var viewerContainer = document.getElementById('viewer')

          this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(
            viewerContainer)

          this.viewer.initialize()
        }

        var path = LMVDocument.getViewablePath(
          geometryItems3d[0])

        let model = await this.loadModel(path, {
          sessionId: LMVDocument.acmSessionId
        })

        model.name = data.name

        this.viewer.loadExtension(
          'Viewing.Extension.ModelTransformer', {
            parentControl: this.ctrlGroup
          })

        this.modelTransformer =
          this.viewer.loadedExtensions[
            'Viewing.Extension.ModelTransformer']

        this.modelTransformer.addModel(model)

        // fits model to view - need to wait for instance tree
        // but no event gets fired

        let fitToView = ()=>{

          var instanceTree = model.getData().instanceTree;

          if(instanceTree){

            this.fitModelToView(model)
          }
          else {

            setTimeout(()=>{
              fitToView()
            }, 500)
          }
        }

        fitToView()
      }
    }, (err) => {

      this.logError(err)

    }, {

      'origin': '*',
      'oauth2AccessToken': tokenResponse.access_token,
      'x-ads-acm-namespace': 'WIPDMSTG', // STG for staging,
      'x-ads-acm-check-groups': 'true'
    })

  }

  //////////////////////////////////////////////////////////////////////////
  // Log viewer errors with more explicit message
  //
  //////////////////////////////////////////////////////////////////////////
  loadModel(path, opts) {

    return new Promise(async(resolve, reject)=> {

      let _onGeometryLoaded = (event)=> {

        this.viewer.removeEventListener(
          Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
          _onGeometryLoaded);

        return resolve(event.model);
      }

      this.viewer.addEventListener(
        Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
        _onGeometryLoaded);

      this.viewer.load(path, null, null, null, opts.sessionId);

      //this.viewer.loadModel(path, opts, ()=> {},
      //  (errorCode, errorMessage, statusCode, statusText)=> {
      //
      //    this.viewer.removeEventListener(
      //      Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      //      _onGeometryLoaded);
      //
      //    return reject({
      //      errorCode: errorCode,
      //      errorMessage: errorMessage,
      //      statusCode: statusCode,
      //      statusText: statusText
      //    });
      //  });
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  fitModelToView (model) {

    var instanceTree = model.getData().instanceTree;

    var rootId = instanceTree.getRootId();

    this.viewer.fitToView([rootId]);
  }

  //////////////////////////////////////////////////////////////////////////
  // Log viewer errors with more explicit message
  //
  //////////////////////////////////////////////////////////////////////////
  logError (err) {

    switch (err) {

      case 1: //Autodesk.Viewing.ErrorCode.UNKNOWN_FAILURE
        console.log('An unknown failure has occurred.');
        break;

      case 2: //Autodesk.Viewing.ErrorCode.BAD_DATA
        console.log('Bad data (corrupted or malformed) was encountered.');
        break;

      case 3: //Autodesk.Viewing.ErrorCode.NETWORK_FAILURE
        console.log('A network failure was encountered.');
        break;

      case 4: //Autodesk.Viewing.ErrorCode.NETWORK_ACCESS_DENIED
        console.log('Access was denied to a network resource (HTTP 403).');
        break;

      case 5: //Autodesk.Viewing.ErrorCode.NETWORK_FILE_NOT_FOUND
        console.log('A network resource could not be found (HTTP 404).');
        break;

      case 6: //Autodesk.Viewing.ErrorCode.NETWORK_SERVER_ERROR
        console.log('A server error was returned when accessing ' +
          'a network resource (HTTP 5xx).');
        break;

      case 7: //Autodesk.Viewing.ErrorCode.NETWORK_UNHANDLED_RESPONSE_CODE
        console.log('An unhandled response code was returned ' +
          'when accessing a network resource (HTTP everything else).');
        break;

      case 8: //Autodesk.Viewing.ErrorCode.BROWSER_WEBGL_NOT_SUPPORTED
        console.log('Browser error: WebGL is not ' +
          'supported by the current browser.');
        break;

      case 9: //Autodesk.Viewing.ErrorCode.BAD_DATA_NO_VIEWABLE_CONTENT
        console.log('There is nothing viewable in the fetched document.');
        break;

      case 10: //Autodesk.Viewing.ErrorCode.BROWSER_WEBGL_DISABLED
        console.log('Browser error: WebGL is supported, but not enabled.');
        break;

      case 11: //Autodesk.Viewing.ErrorCode.RTC_ERROR
        console.log('Collaboration server error');
        break;
    }
  }
}

$(document).ready(() => {

  var app = new App()

  app.initialize()
})
